using { com.invoiceapp.master, com.invoiceapp.transaction } from '../db/schema';

service InvoiceService @(path: '/invoice', requires: 'authenticated-user') {
    @odata.draft.enabled
    entity Invoices @(
        restrict: [
            {grant: ['READ'], to: 'Display'},
            {grant: ['WRITE', 'DELETE', 'submitInvoice'], to: 'Edit'}
        ]
    ) as projection on transaction.Invoice
    actions {
        action submitInvoice() returns Invoices;
    };
    // @odata.draft.enabled
    entity LineItems as projection on transaction.LineItem;
    entity Vendors as projection on master.Vendor;
    entity CostCenters as projection on master.CostCenter;

    @readonly
    entity InvoiceStatus as projection on master.InvoiceStatus;

}