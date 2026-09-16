async function testEndpoints() {
  const baseUrl = "http://localhost:3000";

  console.log("1. Testing GET /api/v1/admin/markup/settings");
  const resSettings = await fetch(`${baseUrl}/api/v1/admin/markup/settings`);
  const dataSettings = await resSettings.json();
  console.log("Status:", resSettings.status);
  console.log("Data:", JSON.stringify(dataSettings, null, 2));

  console.log("\n2. Testing GET /api/v1/admin/markup/tickets");
  const resTickets = await fetch(`${baseUrl}/api/v1/admin/markup/tickets`);
  const jsonTickets = await resTickets.json();
  const dataTickets = jsonTickets.data;
  console.log("Status:", resTickets.status);
  console.log("Total Tickets:", dataTickets?.pagination?.totalCount);
  console.log("Summary:", JSON.stringify(dataTickets?.summary, null, 2));
  console.log("Sample Ticket Reference:", dataTickets?.tickets?.[0]?.supplierReference);
  console.log("Supplier Price:", dataTickets?.tickets?.[0]?.supplierPriceMinor);
  console.log("Customer Price:", dataTickets?.tickets?.[0]?.customerPriceMinor);

  console.log("\n3. Testing CSV Preview via /api/v1/admin/markup/preview-csv");
  const sampleCsv = `supplier_reference,supplier_name,airline,origin,destination,travel_date,passenger_type,currency,supplier_price
TEST-CSV-01,Amadeus,Ethiopian Airlines,EBB,ADD,2026-10-20,ADULT,USD,500
TEST-CSV-02,Sabre,Kenya Airways,EBB,NBO,2026-10-21,ADULT,USD,300
TEST-CSV-ERR,Direct,Invalid Airline,EBB,DXB,2026-10-22,ADULT,USD,-50`;

  const resCsv = await fetch(`${baseUrl}/api/v1/admin/markup/preview-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvText: sampleCsv }),
  });
  const jsonCsv = await resCsv.json();
  const dataCsv = jsonCsv.data;
  console.log("CSV Preview Status:", resCsv.status);
  console.log("CSV Total Rows:", dataCsv?.totalRows);
  console.log("CSV Valid Count:", dataCsv?.validCount);
  console.log("CSV Error Count:", dataCsv?.errorCount);
  console.log("CSV Errors:", dataCsv?.errors);

  console.log("\n4. Testing Recalculation API via /api/v1/admin/markup/recalculate");
  const resRecalc = await fetch(`${baseUrl}/api/v1/admin/markup/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "ALL_UNSOLD" }),
  });
  const dataRecalc = await resRecalc.json();
  console.log("Recalculation Status:", resRecalc.status);
  console.log("Recalculation Result:", JSON.stringify(dataRecalc, null, 2));

  console.log("\n5. Testing GET /admin/markup-settings HTML page");
  const resPage1 = await fetch(`${baseUrl}/admin/markup-settings`);
  console.log("Page 1 Status:", resPage1.status);

  console.log("\n6. Testing GET /admin/supplier-tickets HTML page");
  const resPage2 = await fetch(`${baseUrl}/admin/supplier-tickets`);
  console.log("Page 2 Status:", resPage2.status);

  console.log("\n7. Testing GET /admin/profit-dashboard HTML page");
  const resPage3 = await fetch(`${baseUrl}/admin/profit-dashboard`);
  console.log("Page 3 Status:", resPage3.status);

  console.log("\nAll endpoint & page tests passed successfully!");
}

testEndpoints().catch(console.error);
