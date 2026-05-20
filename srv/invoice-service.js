const cds = require('@sap/cds')

module.exports = class InvoiceService extends cds.ApplicationService {
  init() {

    const { Invoices, Vendors, CostCenters, InvoiceStatus, LineItems } = cds.entities('InvoiceService')

    // ─────────────────────────────────────────────────────────
        // HANDLER: Validate Invoice dates
        // dueDate must be on or after invoiceDate
    // ─────────────────────────────────────────────────────────
    this.before(['CREATE', 'UPDATE'], Invoices, async (req) => {
      const { invoiceDate, dueDate } = req.data;

      if (invoiceDate && dueDate && dueDate < invoiceDate) {
        req.error(400, 'Due date must be on or after the invoice date.');
      }
      console.log('Before CREATE/UPDATE Invoices', req.data)
    })
    this.after('READ', Invoices, async (invoices, req) => {
      console.log('After READ Invoices', invoices)
    })
    this.before(['CREATE', 'UPDATE'], Vendors, async (req) => {
      console.log('Before CREATE/UPDATE Vendors', req.data)
    })
    this.after('READ', Vendors, async (vendors, req) => {
      console.log('After READ Vendors', vendors)
    })
    this.before(['CREATE', 'UPDATE'], CostCenters, async (req) => {
      console.log('Before CREATE/UPDATE CostCenters', req.data)
    })
    this.after('READ', CostCenters, async (costCenters, req) => {
      console.log('After READ CostCenters', costCenters)
    })
    this.before(['CREATE', 'UPDATE'], InvoiceStatus, async (req) => {
      console.log('Before CREATE/UPDATE InvoiceStatus', req.data)
    })
    this.after('READ', InvoiceStatus, async (invoiceStatus, req) => {
      console.log('After READ InvoiceStatus', invoiceStatus)
    })
    this.before(['CREATE', 'UPDATE'], LineItems, async (req) => {
      const { quantity, unitPrice } = req.data;

      if (quantity != null && unitPrice != null) {
        // toFixed(2) ensures we always get 2 decimal places
        req.data.amount = parseFloat(
          (quantity * unitPrice).toFixed(2)
        );
      }
      console.log('Before CREATE/UPDATE LineItems', req.data)
    })
    this.after('READ', LineItems, async (lineItems, req) => {
      console.log('After READ LineItems', lineItems)
    })

    // ─────────────────────────────────────────────────────────
        // HANDLER: submitInvoice — bound action
        // Changes Invoice status from Draft (D) → Submitted (SB)
        //
        // Status transitions must be controlled server-side.
        // We won't let a client just PATCH status_code to anything.
    // ─────────────────────────────────────────────────────────
        this.on('submitInvoice', 'Invoices', async (req) => {
            const { ID } = req.params[0]; // ID of the specific Invoice

            // Step 1: Fetch the current invoice
            const invoice = await SELECT.one
                .from('InvoiceService.Invoices')
                .where({ ID });

            // Step 2: Guard — invoice must exist
            if (!invoice) {
                return req.error(404, `Invoice with ID ${ID} not found.`);
            }

            // Step 3: Guard — only Draft invoices can be submitted
            if (invoice.status_code !== 'D') {
                return req.error(
                    400,
                    `Invoice cannot be submitted. Current status: '${invoice.status_code}'. Only Draft (D) invoices can be submitted.`
                );
            }

            // Step 4: Update status to Submitted
            await UPDATE('InvoiceService.Invoices')
                .set({ status_code: 'SB' })
                .where({ ID });

            // Step 5: Return the updated invoice to the caller
            return SELECT.one
                .from('InvoiceService.Invoices')
                .where({ ID });
        });

    return super.init()
  }
}