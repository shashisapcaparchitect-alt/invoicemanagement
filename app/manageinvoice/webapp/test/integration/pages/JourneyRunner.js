sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/invoiceapp/manageinvoice/test/integration/pages/InvoicesList",
	"com/invoiceapp/manageinvoice/test/integration/pages/InvoicesObjectPage",
	"com/invoiceapp/manageinvoice/test/integration/pages/LineItemsObjectPage"
], function (JourneyRunner, InvoicesList, InvoicesObjectPage, LineItemsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/invoiceapp/manageinvoice') + '/test/flp.html#app-preview',
        pages: {
			onTheInvoicesList: InvoicesList,
			onTheInvoicesObjectPage: InvoicesObjectPage,
			onTheLineItemsObjectPage: LineItemsObjectPage
        },
        async: true
    });

    return runner;
});

