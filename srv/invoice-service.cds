using { com.invoiceapp.master, com.invoiceapp.transaction } from '../db/schema';

service InvoiceService @(path: '/invoice') {
    @odata.draft.enabled
    entity Invoices as projection on transaction.Invoice
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