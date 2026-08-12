import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  Lead, Account, Contact, Project, Material, PaymentDelivered, 
  OneTimePayment, PaymentReceived, ProjectDocument, OtherMaterial, InteriorMaterial, QuotationModel, Settings 
} from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const [
      leads, accounts, contacts, projects, materials, 
      paymentsDelivered, oneTimePayments, paymentsReceived, 
      projectDocuments, otherMaterials, interiorMaterials, quotations, projectCounterDoc
    ] = await Promise.all([
      Lead.find().lean(),
      Account.find().lean(),
      Contact.find().lean(),
      Project.find().lean(),
      Material.find().lean(),
      PaymentDelivered.find().lean(),
      OneTimePayment.find().lean(),
      PaymentReceived.find().lean(),
      ProjectDocument.find().lean(),
      OtherMaterial.find().lean(),
      InteriorMaterial.find().lean(),
      QuotationModel.find().lean(),
      Settings.findOne({ key: 'projectCounter' }).lean()
    ]);

    // Format _id to id
    const formatData = (data: any[]) => data.map((item: any) => {
      item.id = item._id.toString();
      delete item._id;
      delete item.__v;
      return item;
    });

    return NextResponse.json({
      leads: formatData(leads),
      accounts: formatData(accounts),
      contacts: formatData(contacts),
      projects: formatData(projects),
      materials: formatData(materials),
      paymentsDelivered: formatData(paymentsDelivered),
      oneTimePayments: formatData(oneTimePayments),
      paymentsReceived: formatData(paymentsReceived),
      projectDocuments: formatData(projectDocuments),
      otherMaterials: formatData(otherMaterials),
      interiorMaterials: formatData(interiorMaterials),
      quotations: formatData(quotations),
      projectCounter: projectCounterDoc ? projectCounterDoc.value : 1,
    });
  } catch (error) {
    console.error('Error fetching CRM data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
