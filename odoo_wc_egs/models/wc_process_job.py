from odoo import models, fields, api


class WcProcessJob(models.Model):
    _name = 'wc.process.job.egs'
    _order = 'id desc'
    _description = "WooCommerce Process Job"

    name = fields.Char('Name', default=lambda self: self.env['ir.sequence'].next_by_code('wc.process.job.egs'))
    wc_instance_id = fields.Many2one('wc.instance.egs', "Instance")
    line_ids = fields.One2many('wc.process.job.egs.line', 'wc_job_id', "Process Job Line")
    wc_request = fields.Char("Request")
    wc_response = fields.Text("Response")
    process_type = fields.Selection(
        [('product', 'Product'), ('order', 'Order'), ('coupon', 'Coupon'), ('customer', 'Customer'),
         ('category', 'Product Category'), ('tag', 'Product Tags'), ('tax', 'Sale Order Tax'),
         ('attribute', 'Product Attribute'), ('attribute_val', 'Product Attribute Value'),
         ('payment_gateway', 'Payment Gateway')], "Process Type")
    operation_type = fields.Selection(
        [('import', 'Import'), ('import_sync', 'Import/Sync'), ('export', 'Export'), ('update', 'Update')],
        "Operation Type")
    message = fields.Text("Message")


class WcProcessJobLine(models.Model):
    _name = 'wc.process.job.egs.line'
    _order = 'id desc'
    _description = "WooCommerce Process Job"

    wc_job_id = fields.Many2one("wc.process.job.egs", "Process Job")
    message = fields.Char("Message")
