namespace com.invoiceapp;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

context master {
// ---------------------------------------------------------
// COST CENTER
// Represents the department/cost center an invoice is billed to
// ---------------------------------------------------------
entity CostCenter : cuid, managed {
    centerCode  : String(10)  not null;
    description : String(100);
    department  : String(50);
}

// ---------------------------------------------------------
// VENDOR
// Supplier who sends invoices to us
// Association to many Invoice
// (Vendor does not own invoices; invoices exist independently)
// ---------------------------------------------------------
entity Vendor : cuid, managed {
    name         : String(100) not null;
    taxId        : String(20);
    email        : String(100);
    phone        : String(20);
    street       : String(100);
    city         : String(50);
    country      : String(3);
    invoices     : Association to many transaction.Invoice on invoices.vendor = $self;
}

// ---------------------------------------------------------
// INVOICE STATUS (CodeList)
// For Fiori value help
// Seed data: DR=Draft, SB=Submitted, AP=Approved, RJ=Rejected, PD=Paid
// ---------------------------------------------------------
entity InvoiceStatus : CodeList {
    key code : String(2);
}

}

context transaction {
// ---------------------------------------------------------
// INVOICE
// Core entity — the invoice header
// ---------------------------------------------------------
entity Invoice : cuid, managed {
    invoiceNumber : String(20)   not null;
    invoiceDate   : Date         not null;
    dueDate       : Date;
    grossAmount   : Decimal(13,2);
    currency      : String(3)    default 'INR';
    notes         : String(500);

    // --- Associations ---
    vendor        : Association to master.Vendor     not null;
    costCenter    : Association to master.CostCenter;

    status_code   : String(2)    not null default 'D';
    status        : Association to master.InvoiceStatus on status.code = status_code;

    // --- Composition: Invoice owns its line items ---
    lineItems     : Composition of many LineItem on lineItems.invoice = $self;
}

// ---------------------------------------------------------
// LINE ITEM
// Individual line on an invoice (product/service billed)
// ---------------------------------------------------------
entity LineItem : cuid, managed {
    invoice        : Association to transaction.Invoice;
    positionNumber : Integer;
    description    : String(200) not null;
    quantity       : Decimal(10,2);
    unitPrice      : Decimal(13,2);
    amount         : Decimal(13,2);  // Computed field: quantity × unitPrice
                                     // Must be kept in sync via service handler
}

}