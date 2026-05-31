// sap.ui.define([
//     "sap/m/MessageToast",
//     'sap/ui/model/json/JSONModel',
//     'sap/ui/model/Filter',
//     'sap/ui/model/FilterOperator'
// ], function(MessageToast, JSONModel, Filter, FilterOperator) {
//     'use strict';

//     return {
//         /**
//          * Generated event handler.
//          *
//          * @param oEvent the event object provided by the event provider.
//          */
//         onPress: function(oEvent) {
//             MessageToast.show("Custom handler invoked.");
//         },

//         // ─────────────────────────────────────────────────────
//         // READ — Load and compute line item statistics
//         //
//         // Called when user clicks "Load Stats" button
//         // ─────────────────────────────────────────────────────
//         onLoadStats: function (oEvent) {
//             const oButton = oEvent.getSource();

//             // ── Step 1: Set up local JSONModel on the VBox ──

//             const oVBox = oButton.getParent();

//             if (!oVBox.getModel('stats')) {
//                 oVBox.setModel(
//                     new JSONModel({
//                         totalItems   : '0',
//                         totalAmount  : '0.00',
//                         highestAmount: '0.00'
//                     }),
//                     'stats'
//                 );
//             }


//             // ── Step 2: Get Invoice ID from binding context ──

//             const oInvoiceContext = oButton.getBindingContext();
//             const sInvoiceID      = oInvoiceContext.getProperty('ID');


//             // ── Step 3: OData V4 READ ────────────────────────

//             const oModel      = oButton.getModel();
//             const oListBinding = oModel.bindList(
//                 '/LineItems',
//                 null, null,
//                 [new Filter('invoice_ID', FilterOperator.EQ, sInvoiceID)]
//             );

//             oListBinding
//                 .requestContexts(0, Infinity)
//                 .then(function (aContexts) {

//                     // Convert Contexts → plain JSON
//                     const aItems = aContexts.map(c => c.getObject());

//                     // Compute stats
//                     const nTotal       = aItems.length;
//                     const fTotalAmount = aItems.reduce(
//                         (sum, item) => sum + (item.amount || 0), 0
//                     );
//                     const fHighest     = nTotal > 0
//                         ? Math.max(...aItems.map(i => i.amount || 0))
//                         : 0;

//                     // Update the JSONModel
//                     oVBox.getModel('stats').setData({
//                         totalItems   : String(nTotal),
//                         totalAmount  : fTotalAmount.toFixed(2),
//                         highestAmount: fHighest.toFixed(2)
//                     });

//                     MessageToast.show('Stats loaded successfully!');
//                 })
//                 .catch(function (oError) {
//                     MessageToast.show('Failed to load stats: ' + oError.message);
//                 });
//         }

//     };
// });

sap.ui.define([
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (MessageToast, MessageBox, JSONModel, Filter, FilterOperator) {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPER 1: getRootVBox
    // ─────────────────────────────────────────────────────────
    function getRootVBox(oControl) {
        let oCurrent = oControl;
        while (oCurrent) {
            if (oCurrent.isA('sap.m.VBox')) {
                return oCurrent; // found our section root
            }
            oCurrent = oCurrent.getParent
                ? oCurrent.getParent()
                : null;
        }
        return null;
    }


    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPER 2: initModels
    //
    // Setting up two named JSONModels on the VBox root (once only):
    //
    //   'stats' model → drives the statistics display
    //   'form'  model → two-way bound to the Quick Add inputs
    // ─────────────────────────────────────────────────────────
    function initModels(oVBox) {
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
        if (!oVBox.getModel('form')) {
            oVBox.setModel(
                new JSONModel({
                    description: '',
                    quantity   : '1',
                    unitPrice  : '',
                    calculatedAmount : '0.00'
                }),
                'form'
            );
        }
    }


    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPER 3: refreshStats
    //
    // Extracted from onLoadStats so both the Load button
    // AND the Add button can trigger a stats refresh.
    //
    // This is the OData V4 READ pattern
    // ─────────────────────────────────────────────────────────
    function refreshStats(oVBox, sInvoiceID, oModel) {
        const oBinding = oModel.bindList(
            '/LineItems',
            null, null,
            [new Filter('invoice_ID', FilterOperator.EQ, sInvoiceID)]
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

                oVBox.getModel('stats').setData({
                    totalItems   : String(nTotal),
                    totalAmount  : fTotal.toFixed(2),
                    highestAmount: fHighest.toFixed(2)
                });
            });
    }


    // ─────────────────────────────────────────────────────────
    // PUBLIC HANDLERS — returned to the fragment via core:require
    // ─────────────────────────────────────────────────────────
    return {

        onPress: function (oEvent) {
            MessageToast.show('Custom handler invoked.');
        },


        // ── LOAD STATS button ────────────────────────────────
        onLoadStats: function (oEvent) {
            const oSource    = oEvent.getSource();
            const oVBox      = getRootVBox(oSource);
            initModels(oVBox);

            const sInvoiceID = oSource.getBindingContext()
                                      .getProperty('ID');
            const oModel     = oSource.getModel();

            refreshStats(oVBox, sInvoiceID, oModel);
            MessageToast.show('Stats refreshed');
        },

        // ── NEW: Live amount calculation ─────────────────────
        // Triggered by liveChange on Quantity and Unit Price inputs.
        //
        onFormFieldChange: function (oEvent) {
            const oVBox      = getRootVBox(oEvent.getSource());
            initModels(oVBox);

            const oFormModel = oVBox.getModel('form');
            const fQty       = parseFloat(
                oFormModel.getProperty('/quantity')
            ) || 0;
            const fPrice     = parseFloat(
                oFormModel.getProperty('/unitPrice')
            ) || 0;

            // Same formula as our CAP handler
            const fAmount = parseFloat(
                (fQty * fPrice).toFixed(2)
            );

            oFormModel.setProperty('/calculatedAmount',
                fAmount.toFixed(2)
            );
        },


        // ── ADD LINE ITEM button ─────────────────────────────
        onAddLineItem: async function (oEvent) {
    const oSource = oEvent.getSource();
    const oVBox   = getRootVBox(oSource);
    initModels(oVBox);

    // ── Read form values ─────────────────────────────────
    const oFormModel   = oVBox.getModel('form');
    const sDescription = oFormModel.getProperty('/description').trim();
    const fQuantity    = parseFloat(oFormModel.getProperty('/quantity'));
    const fUnitPrice   = parseFloat(oFormModel.getProperty('/unitPrice'));

    // ── Validation ───────────────────────────────────────
    if (!sDescription) {
        MessageBox.warning('Please enter a description.');
        return;
    }
    if (isNaN(fQuantity) || fQuantity <= 0) {
        MessageBox.warning('Quantity must be greater than zero.');
        return;
    }
    if (isNaN(fUnitPrice) || fUnitPrice <= 0) {
        MessageBox.warning('Unit Price must be greater than zero.');
        return;
    }

    const fAmount = parseFloat(
                (fQuantity * fUnitPrice).toFixed(2)
            );

    // ── Check if Invoice is in Edit Mode ──────────
    //
    // IsActiveEntity = true  → view mode (no draft exists yet)
    //                          → cannot create line items
    // IsActiveEntity = false → edit mode (we ARE the draft)
    //                          → safe to create line items
    //
    const oInvoiceContext = oSource.getBindingContext();
    const bIsActiveEntity = oInvoiceContext.getProperty('IsActiveEntity');

    if (bIsActiveEntity) {
        MessageBox.information(
            'Please click "Edit" on the Invoice first.\n\n' +
            'Line items can only be added while in edit mode.'
        );
        return;
    }

    // ── Create via ROOT entity (not absolute path) ─
    //
    //    oModel.bindList('/LineItems')
    //    → bypasses draft, CAP rejects with 422
    //
    // ✅ After: oModel.bindList('lineItems', oInvoiceContext)
    //    → goes through the Invoice (root entity)
    //    → respects the draft mechanism
    //    → no invoice_ID needed (parent context provides it)
    //
    const oModel       = oSource.getModel();

    let nNextPosition = 1;
            try {
                const oReadBinding = oModel.bindList(
                    'lineItems',
                    oInvoiceContext
                );
                const aContexts = await oReadBinding
                    .requestContexts(0, Infinity);
                const aItems = aContexts.map(c => c.getObject());

                if (aItems.length > 0) {
                    // Number() handles null/undefined → 0
                    const aPositions = aItems.map(
                        i => Number(i.positionNumber) || 0
                    );
                    nNextPosition = Math.max(...aPositions) + 1;
                }
            } catch (e) {
                nNextPosition = 1;
            }

    const oListBinding = oModel.bindList(
        'lineItems',       // relative path — no leading slash
        oInvoiceContext    // Invoice context is the parent
    );

    try {
        const oNewContext = oListBinding.create({
            description: sDescription,
            quantity   : fQuantity,
            unitPrice  : fUnitPrice,
            amount        : fAmount,  
            positionNumber: nNextPosition
            // invoice_ID removed — parent context handles it
        });

        await oNewContext.created();

        oInvoiceContext.refresh();

        MessageToast.show(
            'Line item added at position ' + nNextPosition
        );

        // Clear form
        oFormModel.setData({
            description: '',
            quantity   : '1',
            unitPrice  : ''
        });

        // Refresh stats
        const sInvoiceID = oInvoiceContext.getProperty('ID');
        refreshStats(oVBox, sInvoiceID, oModel);

    } catch (oError) {
        MessageBox.error('Failed to add line item.\n' + oError.message);
    }
},


        // ── CLEAR FORM button ────────────────────────────────
        onClearForm: function (oEvent) {
            const oVBox = getRootVBox(oEvent.getSource());
            initModels(oVBox);

            oVBox.getModel('form').setData({
                description: '',
                quantity   : '1',
                unitPrice  : ''
            });

            MessageToast.show('Form cleared');
        }
    };
});