using { com.invoiceapp.master, com.invoiceapp.transaction } from '../db/schema';

service InvoiceService @(path: '/invoice') {

    entity Invoices as projection on transaction.Invoice;
    entity LineItems as projection on transaction.LineItem;
    entity Vendors as projection on master.Vendor;
    entity CostCenters as projection on master.CostCenter;

    @readonly
    entity InvoiceStatus as projection on master.InvoiceStatus;

}