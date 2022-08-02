from odoo import models, fields, api, _, tools


class WcOrderStatusEgs(models.Model):
    _name = "wc.order.status.egs"
    _description = "WooCommerce Order Status"

    @api.onchange("validate_order")
    def onchange_validate_order(self):
        for record in self:
            if not record.validate_order:
                record.create_invoice = False

    @api.onchange("create_invoice")
    def onchange_create_invoice(self):
        for record in self:
            if not record.create_invoice:
                record.validate_invoice = False

    @api.onchange("validate_invoice")
    def onchange_validate_invoice(self):
        for record in self:
            if not record.validate_invoice:
                record.register_payment = False

    name = fields.Char("Name")
    status = fields.Char("Status")
    wc_instance_id = fields.Many2one('wc.instance.egs', "WooCommerce Instance")
    validate_order = fields.Boolean("Validate Order", default=False)
    create_invoice = fields.Boolean('Create Invoice', default=False)
    validate_invoice = fields.Boolean('Validate Invoice', default=False)
    register_payment = fields.Boolean('Register Payment', default=False)
    validate_shipping = fields.Boolean("Validate Delivery", default=False)
    cancel_order = fields.Boolean("Cancel Order", default=False)
    _sql_constraints = [('order_status_unique_constraint', 'unique(status,wc_instance_id)',
                         "Order status must be unique in the list")]

    @api.multi
    def import_order_status(self, wc_instance):
        if not wc_instance:
            return False
        wcapi = wc_instance.wc_connect()
        wc_job = self.env['wc.process.job.egs'].create(
            {'wc_instance_id': wc_instance.id, 'process_type': 'order', 'operation_type': 'import',
             'message': 'Process for Import Order Status'})
        res = wcapi.get("", wc_job=wc_job)
        if not res:
            return False
        ver_path = "/wc/{0}/orders".format(wc_instance.wc_version)
        for endpoint in res.json().get('routes').get(ver_path).get('endpoints'):
            if not endpoint.get('methods') == ['GET']:
                continue
            if wc_instance.wc_version == 'v3':
                wc_order_status = endpoint.get('args').get('status').get('items').get('enum')
            else:
                wc_order_status = endpoint.get('args').get('status').get('enum')
            for status in wc_order_status:
                if status in ['any', 'trash']:
                    continue
                order_status = self.search([('status', '=', status), ('wc_instance_id', '=', wc_instance.id)])
                if order_status:
                    continue
                self.create({'status': status, 'name': status.replace("-", " ").capitalize(),
                             'wc_instance_id': wc_instance.id})
        return True

    @api.multi
    def process_order_autoworkflow(self, order=False, wc_job=False):
        if not order:
            return False
        sale_order_line_obj = self.env['sale.order.line']
        account_payment_obj = self.env['account.payment']
        order_status = order.order_status
        if order.invoice_status and order.invoice_status == 'invoiced':
            return True
        if order_status.cancel_order:
            try:
                order.action_cancel()
            except Exception as e:
                wc_job and wc_job.env['wc.process.job.egs.line'].create(
                    {'wc_job_id': wc_job.id, 'message': "Error while cancel order {0} \n {1}".format(order.name, e)})
            return True
        if order_status.validate_order:
            try:
                with self._cr.savepoint(), tools.mute_logger('odoo.sql_db'):
                    order.action_confirm()
            except Exception as e:
                wc_job and wc_job.env['wc.process.job.egs.line'].create(
                    {'wc_job_id': wc_job.id, 'message': "Error while confirm order {0} \n {1}".format(order.name, e)})
            try:
                with self._cr.savepoint(), tools.mute_logger('odoo.sql_db'):
                    order.picking_ids.action_assign()
                    order.picking_ids.button_validate()
            except Exception as e:
                wc_job and wc_job.env['wc.process.job.egs.line'].create(
                    {'wc_job_id': wc_job.id,
                     'message': "Error while validate delivery for order {0} \n {1}".format(order.name, e)})
        if order.wc_instance_id.invoice_policy == 'delivery':
            return True
        if not order.wc_instance_id.invoice_policy and not sale_order_line_obj.search(
                [('product_id.invoice_policy', '!=', 'delivery'), ('order_id', 'in', order.ids)]):
            return True
        if not order.invoice_ids:
            if order_status.create_invoice:
                try:
                    with self._cr.savepoint(), tools.mute_logger('odoo.sql_db'):
                        order.action_invoice_create()
                except Exception as e:
                    wc_job and wc_job.env['wc.process.job.egs.line'].create(
                        {'wc_job_id': wc_job.id,
                         'message': "Error while create invoice for order {0} \n {1}".format(order.name, e)})
        if order_status.validate_invoice:
            for invoice in order.invoice_ids:
                try:
                    with self._cr.savepoint(), tools.mute_logger('odoo.sql_db'):
                        invoice.action_invoice_open()
                except Exception as e:
                    wc_job and wc_job.env['wc.process.job.egs.line'].create(
                        {'wc_job_id': wc_job.id,
                         'message': "Error while validate invoice for order {0} \n {1}".format(order.name, e)})
                if order_status.register_payment:
                    if invoice.residual:
                        try:
                            if order.wc_payment_gateway_id and order.wc_payment_gateway_id.journal_id:
                                journal_id = order.wc_payment_gateway_id.journal_id
                            else:
                                journal_id = order.wc_instance_id.journal_id
                            vals = {
                                'journal_id': journal_id.id,
                                'invoice_ids': [(6, 0, [invoice.id])],
                                'communication': invoice.reference,
                                'currency_id': invoice.currency_id.id,
                                'payment_type': 'inbound',
                                'partner_id': invoice.commercial_partner_id.id,
                                'amount': invoice.residual,
                                'payment_method_id': journal_id.inbound_payment_method_ids.id,
                                'partner_type': 'customer'
                            }
                            with self._cr.savepoint(), tools.mute_logger('odoo.sql_db'):
                                new_rec = account_payment_obj.create(vals)
                                new_rec.post()
                        except Exception as e:
                            wc_job and wc_job.env['wc.process.job.egs.line'].create(
                                {'wc_job_id': wc_job.id,
                                 'message': "Error while validate invoice for order {0} \n {1}".format(order.name, e)})
        return True
