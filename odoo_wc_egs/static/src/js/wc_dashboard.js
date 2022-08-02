odoo.define('odoo_wc_egs.action_wc_dashboard', function (require) {
    'use strict';
    var AbstractAction = require('web.AbstractAction');
    var ControlPanelMixin = require('web.ControlPanelMixin');
    var core = require('web.core');
    var session = require('web.session');
    var rpc = require('web.rpc');

    var _t = core._t;
    var QWeb = core.qweb;

    var Dashboard = AbstractAction.extend(ControlPanelMixin, {
        template: 'WCDashboardMain',
        events: {
            'click .import_wc_orders': 'on_wc_import_orders',
            'click .update_wc_order_status': 'on_update_wc_order_status',
            'click .import_wc_products': 'on_import_wc_products',
            'click .export_wc_products': 'on_export_wc_products',
            'click .import_wc_stock': 'on_import_wc_stock',
            'click .export_update_wc_coupons': 'on_export_update_wc_coupons',
            'click .import_wc_coupons': 'on_import_wc_coupons',
            'click .wc_draft_invoice': 'on_wc_draft_invoice',
            'click .import_wc_customers': 'on_import_wc_customers',
            'click .import_wc_categs': 'on_import_wc_categs',
            'click .export_wc_categs': 'on_export_wc_categs',
            'click .import_wc_tags': 'on_import_wc_tags',
            'click .export_wc_tags': 'on_export_wc_tags',
            'click .wc_orders': 'on_wc_orders',
            'click .wc_invoices': 'on_wc_invoices',
            'click .wc_refund_invoice': 'on_wc_refund_invoice',
            'click .wc_products': 'on_wc_products',
            'click .wc_delivery': 'on_wc_delivery',
            'click .wc_customer': 'on_wc_customer',
            'click .wc_coupon': 'on_wc_coupon',
            'click .wc_category': 'on_wc_category',
            'click .wc_tags': 'on_wc_tags'
        },
        init: function (parent, context) {
            this._super(parent, context);
            this.wc_instance = true;
            this._super(parent, context);
        },

        start: function () {
            var self = this;
            for (var i in self.breadcrumbs) {
                self.breadcrumbs[i].title = "WooCommerce Dashboard";
            }
            self.update_cp();
            rpc.query({
                model: "wc.instance.egs",
                method: "get_statistics",
            })
                .then(function (result) {
                    if (result) {
                        self.wc_instance = result[0];
                        $('.o_wc_dashboard').html(QWeb.render('WCDashboardMain', {widget: self}));
                    }
                });
        },

        on_wc_import_orders: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import Orders"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_orders'},
                target: 'new'
            })
        },

        on_import_wc_stock: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import Product's Stock"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_stock'},
                target: 'new'
            })
        },

        on_update_wc_order_status: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Update Order Status"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'update_wc_order_status'},
                target: 'new'
            })
        },

        on_import_wc_customers: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import/Sync Customers"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_customers'},
                target: 'new'
            })
        },

        on_import_wc_categs: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import/Sync Product Category"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_categs'},
                target: 'new'
            })
        },

        on_import_wc_tags: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import/Sync Product Tags"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_tags'},
                target: 'new'
            })
        },

        on_export_update_wc_coupons: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Export/Update Coupons"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'export_update_wc_coupons'},
                target: 'new'
            })
        },

        on_export_wc_categs: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Export/Update Product Category"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'export_wc_categs'},
                target: 'new'
            })
        },

        on_export_wc_tags: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Export/Update Product Category"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'export_wc_tags'},
                target: 'new'
            })
        },

        on_import_wc_products: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import/Sync Products"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_products'},
                target: 'new'
            })
        },

        on_export_wc_products: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Export/Update Products"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'export_wc_products'},
                target: 'new'
            })
        },

        on_import_wc_coupons: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("Import/Sync Coupons"),
                type: 'ir.actions.act_window',
                res_model: 'wc.import.export.process',
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                context: {'process_type': 'import_wc_coupons'},
                target: 'new'
            })
        },

        on_wc_orders: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Orders"),
                type: 'ir.actions.act_window',
                res_model: 'sale.order',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
                domain: [['wc_order_id', '!=', false]],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_customer: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Customers"),
                type: 'ir.actions.act_window',
                res_model: 'res.partner',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'kanban'], [false, 'list'], [false, 'form']],
                domain: [['is_wc_customer', '=', true]],
                context: {'search_default_customer': 1}
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_delivery: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Delivery"),
                type: 'ir.actions.act_window',
                res_model: 'stock.picking',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
                domain: [['wc_instance_id', '!=', false]],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_products: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Products"),
                type: 'ir.actions.act_window',
                res_model: 'wc.product.template.egs',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_coupon: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Coupons"),
                type: 'ir.actions.act_window',
                res_model: 'wc.coupons.egs',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_category: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Category"),
                type: 'ir.actions.act_window',
                res_model: 'wc.category.egs',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        on_wc_tags: function (ev) {
            var self = this;
            ev.stopPropagation();
            ev.preventDefault();
            this.do_action({
                name: _t("WooCommerce Tags"),
                type: 'ir.actions.act_window',
                res_model: 'wc.tags.egs',
                view_mode: 'tree,form',
                view_type: 'form',
                views: [[false, 'list'], [false, 'form']],
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb
            })
        },

        update_cp: function () {
            this.update_control_panel({
                cp_content: {
                    $searchview: this.$searchview,
                },
            });
        },

        on_reverse_breadcrumb: function () {
            this.update_cp();
        },

        on_wc_invoices: function (ev) {
            var self = this;
            return this._rpc({
                model: 'ir.model.data',
                method: 'get_object_reference',
                args: ['account', 'invoice_tree'],
                kwargs: {context: session.user_context},
            })
                .then(function (data) {
                    return self.do_action({
                        name: _t("WooCommerce Invoices"),
                        type: 'ir.actions.act_window',
                        res_model: 'account.invoice',
                        view_mode: 'tree,form',
                        view_type: 'form',
                        views: [[data[1], 'list'], [false, 'form']],
                        domain: [['type', 'in', ['out_invoice', 'out_refund']], ['wc_instance_id', '!=', false]],
                        context: {'default_type': 'out_invoice', 'type': 'out_invoice', 'journal_type': 'sale'},
                        target: 'main'
                    });
                });
        }
    });

    core.action_registry.add('action_wc_dashboard', Dashboard);

    return Dashboard;
});
