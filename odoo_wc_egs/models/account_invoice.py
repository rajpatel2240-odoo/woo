from odoo import models, fields, api


class AccountInvoice(models.Model):
    _inherit = "account.invoice"

    wc_instance_id = fields.Many2one("wc.instance.egs", "WooCommerce Instance")
    invoice_id = fields.Many2one('account.invoice', 'Invoice')
    is_refund_in_wc = fields.Boolean("Refund In WooCommerce", default=False)

    @api.multi
    def invoice_refund_in_wc(self):
        for invoice in self:
            if not invoice.wc_instance_id:
                continue
            wc_job = self.env['wc.process.job.egs'].create(
                {'wc_instance_id': invoice.wc_instance_id.id, 'process_type': 'order', 'operation_type': 'update',
                 'message': 'Process for Refund Order'})
            wcapi = invoice.wc_instance_id.wc_connect()
            orders = []
            if invoice.invoice_id:
                lines = self.env['sale.order.line'].search([('invoice_lines.invoice_id', '=', invoice.invoice_id.id)])
                order_ids = [line.order_id.id for line in lines]
                orders = order_ids and self.env['sale.order'].browse(list(set(order_ids))) or []

            for order in orders:
                data = {'amount': str(invoice.amount_total), 'reason': str(invoice.name or '')}
                refund_res=wcapi.post('orders/%s/refunds' % (order.wc_order_id), data, wc_job=wc_job)
                if refund_res:
                    invoice.write({'is_refund_in_wc': True})
        return True

    @api.model
    def _prepare_refund(self, invoice, date_invoice=None, date=None, description=None, journal_id=None):
        values = super(AccountInvoice, self)._prepare_refund(invoice, date_invoice=date_invoice, date=date,
                                                             description=description, journal_id=journal_id)
        if invoice.wc_instance_id:
            values.update({'wc_instance_id': invoice.wc_instance_id.id, 'invoice_id': invoice.id})
        return values
