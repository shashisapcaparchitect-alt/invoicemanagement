namespace com.invoiceapp;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

entity CostCenter : cuid, managed {
    centerCode  : String(10)  not null;
    description : String(100);
    department  : String(50);
}

entity Vendor : cuid, managed {
    name         : String(100) not null;
    taxId        : String(20);
    email        : String(100);
    phone        : String(20);
    street       : String(100);
    city         : String(50);
    country      : String(3);
    invoices     : Composition of many Invoice on invoices.vendor = $self;
}

entity InvoiceStatus : CodeList {
    key code : String(1);
}

entity Invoice : cuid, managed {
    invoiceNumber : String(20)  not null;
    invoiceDate   : Date        not null;
    dueDate       : Date;
    grossAmount   : Decimal(13,2);
    currency      : String(3)   default 'INR';
    notes         : String(500);
    createdByUser : String(100);

    //--- Associations ---
    vendor        : Association to Vendor;
    costCenter    : Association to CostCenter;
    status        : Association to InvoiceStatus default 'D';

    //--- Composition ---
    lineItems     : Composition of many LineItem on lineItems.invoice = $self;
}

entity LineItem : cuid, managed {
    invoice     : Association to Invoice;
    description : String(200) not null;
    quantity    : Decimal(10,2);
    unitPrice   : Decimal(13,2);
    amount      : Decimal(13,2);
}