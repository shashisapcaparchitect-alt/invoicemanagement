sap.ui.define([
    "sap/m/MessageToast",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(MessageToast, JSONModel, Filter, FilterOperator) {
    'use strict';

    return {
        /**
         * Generated event handler.
         *
         * @param oEvent the event object provided by the event provider.
         */
        onPress: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
        },

        // ─────────────────────────────────────────────────────
        // READ — Load and compute line item statistics
        //
        // Called when user clicks "Load Stats" button
        // ─────────────────────────────────────────────────────
        onLoadStats: function (oEvent) {
            const oButton = oEvent.getSource();

            // ── Step 1: Set up local JSONModel on the VBox ──

            const oVBox = oButton.getParent();

            if (!oVBox.getModel('stats')) {
                oVBox.setModel(
                    new JSONModel({
                        totalItems   : '0',
                        totalAmount  : '0.00',
                        highestAmount: '0.00'
                    }),
                    'stats'
                );
            }


            // ── Step 2: Get Invoice ID from binding context ──

            const oInvoiceContext = oButton.getBindingContext();
            const sInvoiceID      = oInvoiceContext.getProperty('ID');


            // ── Step 3: OData V4 READ ────────────────────────

            const oModel      = oButton.getModel();
            const oListBinding = oModel.bindList(
                '/LineItems',
                null, null,
                [new Filter('invoice_ID', FilterOperator.EQ, sInvoiceID)]
            );

            oListBinding
                .requestContexts(0, Infinity)
                .then(function (aContexts) {

                    // Convert Contexts → plain JSON
                    const aItems = aContexts.map(c => c.getObject());

                    // Compute stats
                    const nTotal       = aItems.length;
                    const fTotalAmount = aItems.reduce(
                        (sum, item) => sum + (item.amount || 0), 0
                    );
                    const fHighest     = nTotal > 0
                        ? Math.max(...aItems.map(i => i.amount || 0))
                        : 0;

                    // Update the JSONModel
                    oVBox.getModel('stats').setData({
                        totalItems   : String(nTotal),
                        totalAmount  : fTotalAmount.toFixed(2),
                        highestAmount: fHighest.toFixed(2)
                    });

                    MessageToast.show('Stats loaded successfully!');
                })
                .catch(function (oError) {
                    MessageToast.show('Failed to load stats: ' + oError.message);
                });
        }

    };
});
