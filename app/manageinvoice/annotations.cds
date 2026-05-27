using InvoiceService as service from '../../srv/invoice-service';

// ──────────────────────────────────────────────────────
// COMMON LABELS
// ──────────────────────────────────────────────────────
annotate service.Invoices with {
    invoiceNumber @title: 'Invoice Number';
    invoiceDate   @title: 'Invoice Date';
    dueDate       @title: 'Due Date';
    grossAmount   @title: 'Gross Amount';
    currency      @title: 'Currency';
    notes         @title: 'Notes';
    status        @title: 'Status';
    vendor        @title: 'Vendor';
    costCenter    @title: 'Cost Center';
}

annotate service.LineItems with {
    positionNumber @title: 'Position';
    description    @title: 'Description';
    quantity       @title: 'Quantity';
    unitPrice      @title: 'Unit Price';
    amount         @title: 'Amount';
}

annotate service.CostCenters with {
    centerCode  @title: 'Cost Center Code';
    description @title: 'Description';
}

annotate service.Vendors with {
    name    @title: 'Vendor Name';
    taxId   @title: 'Tax ID';
    email   @title: 'Email';
    phone   @title: 'Phone';
    street  @title: 'Street';
    city    @title: 'City';
    country @title: 'Country';
}

annotate service.InvoiceStatus with {
    code  @title: 'Status Code';
    name  @title: 'Status Name';
    descr @title: 'Description';
};

// ──────────────────────────────────────────────────────
// LIST REPORT — Invoices
// ──────────────────────────────────────────────────────

annotate service.Invoices with @(UI: {
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Invoice',
        TypeNamePlural: 'Invoices',
        Title         : {Value: invoiceNumber}, //this title will be displayed in object page header
        Description   : {Value: vendor.name} //this description will be displayed in object page header below the title
    },
    LineItem       : [
        {
            position: 10,
            Value   : invoiceNumber
        },
        {
            position: 20,
            Value   : invoiceDate
        },
        {
            position: 30,
            Value   : dueDate
        },
        {
            position: 40,
            Value   : vendor.name
        },
        {
            position: 50,
            Value   : costCenter.centerCode
        },
        {
            position: 60,
            Value   : status.name
        },
        {
            position: 70,
            Value   : grossAmount
        },
        {
            position: 80,
            Value   : currency
        }
    ],

    SelectionFields: [
        invoiceNumber,
        invoiceDate,
        vendor.name,
        costCenter.centerCode,
        status.name
    ],
});
