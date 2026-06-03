sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (ControllerExtension, JSONModel, Filter, FilterOperator) {
	'use strict';

	return ControllerExtension.extend('com.invoiceapp.manageinvoice.ext.controller.ObjectPageExtension', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf com.invoiceapp.manageinvoice.ext.controller.ObjectPageExtension
             */
			onInit: function () {
                    // Set stats model on the View once during init
                    // View-level model persists across re-renders
                    this.base.getView().setModel(
                        new JSONModel({
                            totalItems   : '0',
                            totalAmount  : '0.00',
                            highestAmount: '0.00'
                        }),
                        'stats'
                    );
                },

                // ─────────────────────────────────────────────
                // OFFICIAL SAP editFlow hook
                // Documented in sap.fe.core.controllerextensions.EditFlow
                //
                // onAfterSave fires exactly when the user clicks
                // Save and the draft is successfully activated.
                //
                // This is the correct, documented way to react
                // to save events — NOT onAfterRendering.
                // ─────────────────────────────────────────────
                editFlow: {
                    onAfterSave: function () {
                        const oView    = this.base.getView();
                        const oContext = oView.getBindingContext();

                        if (!oContext) return;

                        this._doRefreshStats(
                            oContext,
                            oView.getModel(),
                            oView.getModel('stats')
                        );
                    }
                }
            },

            _doRefreshStats: function (oContext, oODataModel, oStatsModel) {
                const sInvoiceID = oContext.getProperty('ID');
                if (!sInvoiceID || !oStatsModel) return;

                const oBinding = oODataModel.bindList(
                    '/LineItems', null, null,
                    [new Filter(
                        'invoice_ID',
                        FilterOperator.EQ,
                        sInvoiceID
                    )]
                );

                oBinding.requestContexts(0, Infinity)
                    .then(function (aContexts) {
                        const aItems   = aContexts.map(c => c.getObject());
                        const nTotal   = aItems.length;
                        const fTotal   = aItems.reduce(
                            (s, i) => s + (i.amount || 0), 0
                        );
                        const fHighest = nTotal > 0
                            ? Math.max(...aItems.map(i => i.amount || 0))
                            : 0;

                        oStatsModel.setData({
                            totalItems   : String(nTotal),
                            totalAmount  : fTotal.toFixed(2),
                            highestAmount: fHighest.toFixed(2)
                        });
                    })
                    .catch(function () {});
		}
	});
});
