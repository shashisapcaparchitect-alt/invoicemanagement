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

// ──────────────────────────────────────────────────────
// OBJECT PAGE — Invoice Detail
// ──────────────────────────────────────────────────────

annotate service.Invoices with @(UI: {
    Facets: [
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Invoice Information',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Invoice Details',
                    Target: '@UI.Identification'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Vendor & Cost Center',
                    Target: '@UI.FieldGroup#VendorDetails'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Notes',
                    Target: '@UI.FieldGroup#AdditionalInfo'
                }
            ]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Line Items',
            Target: 'lineItems/@UI.LineItem'
        }
    ],

    Identification: [
        {
            $Type : 'UI.DataField',
            Value : invoiceNumber,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceDate,
        },
        {
            $Type : 'UI.DataField',
            Value : dueDate,
        },
        {
            $Type : 'UI.DataField',
            Value : currency,
        },
        {
            $Type : 'UI.DataField',
            Value : grossAmount,
        }
        ],

    FieldGroup #VendorDetails : {
        Label: 'Vendor & Cost Center',
        Data : [
            {Value: vendor_ID},
            {Value: costCenter_ID}
        ]
    },

    FieldGroup #AdditionalInfo: {
        Label: 'Additional Information',
        Data : [{Value: notes}]
    },
});

annotate service.LineItems with @(
    UI: {
        LineItem: [
        {Value: positionNumber},
        {Value: description},
        {Value: quantity},
        {Value: unitPrice},
        {Value: amount}
    ],
        Facets:[
            {
                $Type: 'UI.ReferenceFacet',
                Label: 'Item Details',
                Target: '@UI.Identification'
            }
        ],
    Identification  : [
        {
            $Type: 'UI.DataField',
            Value: positionNumber
        },
        {
            $Type: 'UI.DataField',
            Value: description
        },
        {
            $Type: 'UI.DataField',
            Value: quantity
        },
        {
            $Type: 'UI.DataField',
            Value: unitPrice
        },
        {
            $Type: 'UI.DataField',
            Value: amount
        }
    ],
 });