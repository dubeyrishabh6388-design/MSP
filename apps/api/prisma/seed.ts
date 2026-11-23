import { PrismaClient, UserRole, VerificationStatus, ServiceWorkflowType, BookingStatus, QuotationStatus, PaymentStatus, RewardCategory, ConsentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Serviqa database with rich categories, subcategories, and imagery...');

  // Clean existing demo data
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.bookingPriceRevision.deleteMany({});
  await prisma.bookingStatusEvent.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.quotationLineItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.requestAttachment.deleteMany({});
  await prisma.serviceRequest.deleteMany({});
  await prisma.providerSettlement.deleteMany({});
  await prisma.socialRecognitionCampaign.deleteMany({});
  await prisma.providerReward.deleteMany({});
  await prisma.rewardRule.deleteMany({});
  await prisma.rewardProgram.deleteMany({});
  await prisma.providerPerformanceSnapshot.deleteMany({});
  await prisma.achievementBadge.deleteMany({});
  await prisma.consentRecord.deleteMany({});
  await prisma.providerService.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.providerVerification.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.categoryFieldDefinition.deleteMany({});
  await prisma.commissionRule.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.serviceArea.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Service Areas
  const areaSouthDelhi = await prisma.serviceArea.create({
    data: {
      name: 'South Delhi & Gurugram',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110016',
      latitude: 28.5355,
      longitude: 77.1990,
      radiusKm: 25.0,
      isActive: true,
    },
  });

  const areaBangalore = await prisma.serviceArea.create({
    data: {
      name: 'Bangalore Central & Tech Corridors',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      radiusKm: 30.0,
      isActive: true,
    },
  });

  const areaMumbai = await prisma.serviceArea.create({
    data: {
      name: 'Mumbai Suburbs & Western Line',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
      radiusKm: 25.0,
      isActive: true,
    },
  });

  // 2. Comprehensive Service Categories with Images & Subcategories
  const categoriesData = [
    {
      name: 'AC Installation, Servicing & Repair',
      slug: 'ac-repair',
      description: 'Expert diagnostic, deep foam jet servicing, gas filling, and split/window AC installation.',
      icon: 'AirVent',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 49900,
      inspectionFee: 29900,
      commissionRate: 12.0,
      subCategories: [
        { name: 'Split AC Deep Foam Jet Servicing', slug: 'split-ac-foam-servicing', description: 'Indoor coil & outdoor condenser pressure foam wash', basePrice: 59900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80' },
        { name: 'Window AC Deep Jet Cleaning', slug: 'window-ac-deep-cleaning', description: 'Complete dismount & filter sanitization', basePrice: 44900, durationMin: 40, imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80' },
        { name: 'AC Gas Leak Diagnosis & Charging', slug: 'ac-gas-charging', description: 'Pressure test, valve seal & original R32/R410 refill', basePrice: 149900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80' },
        { name: 'Split AC Installation & Core Drilling', slug: 'split-ac-installation', description: 'Mounting brackets, copper line vacuuming & testing', basePrice: 119900, durationMin: 90, imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80' },
        { name: 'AC Uninstallation & Gas Pump Down', slug: 'ac-uninstallation', description: 'Safe gas lock and careful unit removal', basePrice: 49900, durationMin: 30, imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'acType', label: 'AC Type', type: 'select', required: true, options: ['Split AC', 'Window AC', 'Inverter AC', 'Cassette AC'] },
        { name: 'capacityTons', label: 'Capacity (Tonnage)', type: 'select', required: true, options: ['1.0 Ton', '1.5 Ton', '2.0 Ton', 'More than 2 Tons'] },
        { name: 'issueType', label: 'Primary Issue', type: 'select', required: true, options: ['Not Cooling', 'Water Leakage', 'Servicing Needed', 'Strange Noise', 'Installation / Uninstallation'] },
        { name: 'needSpareParts', label: 'Suspected Spare Parts Needed?', type: 'checkbox', required: false },
      ]
    },
    {
      name: 'Packers & Movers (Home & Office)',
      slug: 'packers-movers',
      description: 'Hassle-free intercity and intracity relocation with multi-layer packing and transport.',
      icon: 'Truck',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.CUSTOM_QUOTATION,
      basePrice: 350000,
      inspectionFee: 0,
      commissionRate: 15.0,
      subCategories: [
        { name: '1 BHK Complete House Shifting', slug: '1-bhk-shifting', description: 'Dedicated vehicle, cartons, dismantled bed & sofa loading', basePrice: 450000, durationMin: 240, imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=500&q=80' },
        { name: '2 BHK / 3 BHK Relocation with 5-Layer Bubble Packing', slug: '2-3-bhk-shifting', description: 'Full furniture bubble wrap, TV crates, wardrobe packing', basePrice: 850000, durationMin: 360, imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=80' },
        { name: 'Office & Commercial Workspace Shifting', slug: 'office-shifting', description: 'Server rack safety, desk partitions, file crates', basePrice: 1490000, durationMin: 480, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80' },
        { name: 'Vehicle & Bike Hydraulic Transit', slug: 'vehicle-bike-transit', description: 'Covered hydraulic wheel-lock transport', basePrice: 350000, durationMin: 180, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'moveSize', label: 'House / Office Size', type: 'select', required: true, options: ['1 RK / 1 BHK', '2 BHK', '3 BHK', '4+ BHK / Villa', 'Small Office', 'Corporate Office'] },
        { name: 'pickupFloor', label: 'Pickup Floor Number', type: 'number', required: true, placeholder: 'e.g. 3' },
        { name: 'pickupLift', label: 'Service Lift Available at Pickup?', type: 'checkbox', required: false },
        { name: 'dropFloor', label: 'Destination Floor Number', type: 'number', required: true, placeholder: 'e.g. 1' },
        { name: 'dropLift', label: 'Service Lift Available at Drop?', type: 'checkbox', required: false },
        { name: 'fragileItems', label: 'Fragile / High-Value Items (Glass, TV, Piano)?', type: 'textarea', required: false, placeholder: 'Specify items requiring bubble wrap/wooden crate' },
      ]
    },
    {
      name: 'Home & Deep Cleaning',
      slug: 'home-cleaning',
      description: 'Comprehensive mechanized deep cleaning for kitchens, bathrooms, sofas, and full villas.',
      icon: 'Sparkles',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.FIXED_PRICE,
      basePrice: 199900,
      inspectionFee: 0,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Complete Full Home Deep Cleaning', slug: 'full-home-deep-clean', description: 'Floor single-disc buffing, balcony wash, window tracks, all rooms', basePrice: 249900, durationMin: 240, imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80' },
        { name: 'Intensive Bathroom Degreasing & Descaling', slug: 'bathroom-deep-clean', description: 'Hard water tile descaling, toilet pot sanitization, mirror buffing', basePrice: 49900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80' },
        { name: 'Modular Kitchen Deep Scrub & Chimney Degrease', slug: 'kitchen-deep-clean', description: 'Oil stain removal, slab wipe, chimney filter dip', basePrice: 89900, durationMin: 120, imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80' },
        { name: 'Sofa & Carpet Fabric Foam Shampoo', slug: 'sofa-carpet-shampoo', description: 'Dust extraction, wet foam shampoo & moisture suction', basePrice: 69900, durationMin: 90, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'cleaningScope', label: 'Cleaning Package', type: 'select', required: true, options: ['Full Home Deep Cleaning', 'Bathroom Deep Cleaning', 'Kitchen Deep Cleaning', 'Sofa & Carpet Shampooing'] },
        { name: 'furnishedStatus', label: 'Home Furnished Status', type: 'select', required: true, options: ['Fully Furnished', 'Semi Furnished', 'Vacant / Unfurnished'] },
        { name: 'approxSqft', label: 'Approximate Carpet Area (sq. ft.)', type: 'number', required: false, placeholder: 'e.g. 1200' },
      ]
    },
    {
      name: 'Plumbing Services',
      slug: 'plumbing',
      description: 'Pipe repairs, tap leakage, sanitary installations, drainage clearing, and water tank fitting.',
      icon: 'Droplet',
      imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 19900,
      inspectionFee: 14900,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Pipe Leakage & Concealed Line Repair', slug: 'pipe-leakage-repair', description: 'Pressure test & leak fixing in CPVC/PPR lines', basePrice: 24900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=500&q=80' },
        { name: 'Tap, Shower & Diverter Valve Replacement', slug: 'tap-shower-replacement', description: 'Fix dripping fixtures, washer renewal & alignment', basePrice: 19900, durationMin: 30, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80' },
        { name: 'Drainage Blockage Unclogging with Snake Spring', slug: 'drainage-unclogging', description: 'Kitchen sink, washbasin & floor trap clearing', basePrice: 39900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80' },
        { name: 'Overhead Water Tank Mechanized Cleaning', slug: 'water-tank-cleaning', description: 'Sludge removal, high pressure wash & UV sterilization', basePrice: 89900, durationMin: 90, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'plumbingIssue', label: 'Problem Description', type: 'select', required: true, options: ['Water Pipe Leakage', 'Tap or Shower Fitting', 'Toilet / Washbasin Blockage', 'Motor / Tank Pipeline', 'Complete Bathroom Renovation'] },
        { name: 'isEmergency', label: 'Urgent / Active Overflow?', type: 'checkbox', required: false },
      ]
    },
    {
      name: 'Electricians',
      slug: 'electricians',
      description: 'Fuse repairs, wiring fixes, switchboard installation, MCB tripping, and chandelier setup.',
      icon: 'Zap',
      imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 19900,
      inspectionFee: 14900,
      commissionRate: 10.0,
      subCategories: [
        { name: 'MCB Tripping & Short Circuit Diagnosis', slug: 'mcb-tripping-fix', description: 'Isolator testing, load distribution & neutral fault check', basePrice: 29900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80' },
        { name: 'Switchboard, Socket & Dimmer Replacement', slug: 'switchboard-replacement', description: 'Modular switchboard installation and grounding test', basePrice: 14900, durationMin: 30, imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=500&q=80' },
        { name: 'Ceiling Fan, Chandelier & Pendant Hanging', slug: 'fan-chandelier-hanging', description: 'Rod anchoring, heavy fixture balancing & wiring', basePrice: 19900, durationMin: 40, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80' },
        { name: 'Inverter & Battery Wiring Setup', slug: 'inverter-wiring', description: 'Main backup integration, battery terminal greasing', basePrice: 59900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'electricIssue', label: 'Electrical Issue', type: 'select', required: true, options: ['MCB Tripping / Power Cut', 'Switchboard Repair / Installation', 'Ceiling Fan / Chandelier Hanging', 'Short Circuit / Burning Smell', 'Inverter / Wiring Setup'] },
        { name: 'urgency', label: 'Urgency Level', type: 'select', required: true, options: ['Standard Visit', 'Urgent (Within 2 Hours)'] },
      ]
    },
    {
      name: 'Appliance Repair (Washing Machine & Fridge)',
      slug: 'appliance-repair',
      description: 'Single/Double door refrigerators, front/top load washing machines, microwave ovens.',
      icon: 'Cpu',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 29900,
      inspectionFee: 19900,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Washing Machine Drum & Motor Diagnostic', slug: 'washing-machine-repair', description: 'Spin cycle failure, water inlet valve & belt check', basePrice: 29900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80' },
        { name: 'Refrigerator Cooling & Inverter PCB Repair', slug: 'refrigerator-repair', description: 'Thermostat testing, defrost heater & compressor check', basePrice: 34900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80' },
        { name: 'Microwave Oven Magnetron & Sparking Fix', slug: 'microwave-repair', description: 'High voltage diode, turntable motor & heating fix', basePrice: 29900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'applianceType', label: 'Appliance', type: 'select', required: true, options: ['Washing Machine (Front Load)', 'Washing Machine (Top Load)', 'Refrigerator (Single Door)', 'Refrigerator (Double Door / Side-by-Side)', 'Microwave Oven'] },
        { name: 'brandName', label: 'Brand Name', type: 'text', required: true, placeholder: 'e.g. LG, Samsung, Whirlpool' },
        { name: 'symptoms', label: 'Observed Problem', type: 'textarea', required: true, placeholder: 'e.g. Drum not spinning, cooling failure' },
      ]
    },
    {
      name: 'Painting & Wall Makeover',
      slug: 'painting',
      description: 'Interior and exterior painting, waterproof putty, texture walls, and stencil art.',
      icon: 'Paintbrush',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.CUSTOM_QUOTATION,
      basePrice: 500000,
      inspectionFee: 0,
      commissionRate: 12.0,
      subCategories: [
        { name: 'Full Home Interior Wall Repaint', slug: 'full-home-repaint', description: 'Sanding, 2-coat primer, Asian Paints Royale finish', basePrice: 750000, durationMin: 480, imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=500&q=80' },
        { name: 'Waterproofing Putty & Damp Wall Fix', slug: 'waterproofing-putty', description: 'Scraping, anti-fungal barrier coat & smooth putty', basePrice: 299900, durationMin: 240, imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80' },
        { name: 'Single Accent Wall Stencil & Texture', slug: 'accent-wall-texture', description: 'Designer metallic finish & geometric textures', basePrice: 199900, durationMin: 180, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'paintingScope', label: 'Painting Project Type', type: 'select', required: true, options: ['Full Home Painting', 'Single Room / Touch Up', 'Waterproofing & Putty', 'Exterior Painting'] },
        { name: 'paintProvided', label: 'Will Paint Materials be Provided by You?', type: 'checkbox', required: false },
      ]
    },
    {
      name: 'Pest Control',
      slug: 'pest-control',
      description: 'Cockroach gel treatment, anti-termite drill treatment, bed bugs, and mosquito fogging.',
      icon: 'ShieldCheck',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.FIXED_PRICE,
      basePrice: 89900,
      inspectionFee: 0,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Cockroach & Ant Odorless Herbal Gel', slug: 'cockroach-herbal-gel', description: 'Bayer Maxforce dot treatment in cabinets, zero smell', basePrice: 79900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80' },
        { name: 'Anti-Termite Perimeter Drilling & Injection', slug: 'anti-termite-treatment', description: '12mm skirting drill holes & chemical barrier with 2-yr warranty', basePrice: 249900, durationMin: 180, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80' },
        { name: 'Bed Bug 2-Round Spray Eradication', slug: 'bed-bug-eradication', description: 'Mattress steaming & chemical elimination cycle', basePrice: 129900, durationMin: 120, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'pestType', label: 'Target Pests', type: 'select', required: true, options: ['Cockroach & Ant Gel', 'Termite Protection', 'Bed Bug Eradication', 'Rodent / Rat Control'] },
      ]
    },
    {
      name: 'Carpentry & Furniture Assembly',
      slug: 'carpentry',
      description: 'Bed and wardrobe assembly, door lock repairs, custom shelves, and hinge alignments.',
      icon: 'Hammer',
      imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 24900,
      inspectionFee: 19900,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Furniture & IKEA Flatpack Assembly', slug: 'ikea-furniture-assembly', description: 'Hydraulic bed, sliding wardrobe & computer desk build', basePrice: 39900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80' },
        { name: 'Door Locks, Latches & Heavy Mortise Handles', slug: 'door-lock-fitting', description: 'Wood chiseling & secure deadbolt fitting', basePrice: 24900, durationMin: 40, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80' },
        { name: 'Drawer Channels, Soft-Close Hinges & Alignment', slug: 'drawer-channel-repair', description: 'Telescopic channel installation & shutter alignment', basePrice: 19900, durationMin: 30, imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'carpentryTask', label: 'Service Needed', type: 'select', required: true, options: ['IKEA / Flatpack Assembly', 'Door Locks & Latches', 'Hinge & Drawer Channel Repair', 'Custom Shelves / Wood Cutting'] },
      ]
    },
    {
      name: 'RO & Water Purifier Services',
      slug: 'ro-water-purifier',
      description: 'Filter replacement, membrane renewal, UV lamp testing, and installation.',
      icon: 'Waves',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.FIXED_PRICE,
      basePrice: 49900,
      inspectionFee: 0,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Complete Filter, Sediment & Membrane Replacement', slug: 'ro-full-filter-change', description: 'Includes Pre-carbon, Post-carbon & 80 GPD Filmtec membrane', basePrice: 149900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=500&q=80' },
        { name: 'Low Water Flow & Odor Diagnostic', slug: 'ro-flow-diagnostic', description: 'Booster pump pressure check & auto-cut solenoid valve test', basePrice: 29900, durationMin: 30, imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80' },
        { name: 'RO Uninstallation / Reinstallation on Shifting', slug: 'ro-installation', description: 'Diverter tap fitting, drain pipe clipping & TDS calibration', basePrice: 49900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'roBrand', label: 'Purifier Brand', type: 'text', required: true, placeholder: 'Kent, Aquaguard, Pureit, etc.' },
        { name: 'roServiceType', label: 'Service Needed', type: 'select', required: true, options: ['Complete Filter & Membrane Replacement', 'Water Taste / Odour Issue', 'Installation / Relocation'] },
      ]
    },
    {
      name: 'Beauty & Personal Care at Home',
      slug: 'beauty-wellness',
      description: 'Hygienic salon and spa services, waxing, facials, pedicures, and haircuts at home.',
      icon: 'Smile',
      imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.FIXED_PRICE,
      basePrice: 79900,
      inspectionFee: 0,
      commissionRate: 15.0,
      subCategories: [
        { name: 'O3+ Diamond Glow Facial & D-Tan Cleanup', slug: 'glow-facial-cleanup', description: 'Cleanse, organic scrub, blackhead removal, serum massage & peel mask', basePrice: 89900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80' },
        { name: 'Rica Liposoluble Waxing (Full Arms + Legs)', slug: 'rica-waxing-combo', description: 'Colophony-free Italian wax, zero skin peeling', basePrice: 69900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=500&q=80' },
        { name: 'Deluxe Spa Pedicure & Floral Manicure', slug: 'spa-pedicure-manicure', description: 'Sea salt soak, cuticle care, exfoliating scrub & massage', basePrice: 79900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'servicePackage', label: 'Treatment Desired', type: 'select', required: true, options: ['Glow Facial & Cleanup', 'Waxing & Threading Combo', 'Deluxe Manicure & Pedicure', 'Hair Cut & Styling'] },
      ]
    },
    {
      name: 'Computer & IT Support',
      slug: 'computer-it-support',
      description: 'Laptop repair, SSD/RAM upgrade, OS reinstallation, Wi-Fi mesh setup, and data backup.',
      icon: 'Monitor',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      workflowType: ServiceWorkflowType.INSPECTION_FIRST,
      basePrice: 39900,
      inspectionFee: 24900,
      commissionRate: 10.0,
      subCategories: [
        { name: 'Laptop Display Screen & Battery Replacement', slug: 'laptop-screen-battery', description: 'Original panel fitting with dead-pixel testing', basePrice: 49900, durationMin: 60, imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80' },
        { name: 'NVMe SSD / RAM Super Speed Upgrade', slug: 'ssd-ram-upgrade', description: 'Drive cloning, thermals repaste & boot acceleration', basePrice: 39900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80' },
        { name: 'Wi-Fi 6 Mesh Network & Router Coverage Tuning', slug: 'wifi-mesh-setup', description: 'Dead-spot elimination, latency optimization & guest network setup', basePrice: 34900, durationMin: 45, imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80' },
      ],
      fields: [
        { name: 'deviceType', label: 'Device', type: 'select', required: true, options: ['Windows Laptop', 'Apple MacBook', 'Desktop PC', 'Wi-Fi / Network Router'] },
        { name: 'issue', label: 'Primary Issue', type: 'textarea', required: true, placeholder: 'e.g. Blue screen, slow performance, liquid spill' },
      ]
    }
  ];

  const createdCategories: Record<string, any> = {};

  for (const cat of categoriesData) {
    const { fields, subCategories, ...catData } = cat;
    const created = await prisma.serviceCategory.create({
      data: {
        ...catData,
      },
    });
    createdCategories[cat.slug] = created;

    // Seed Subcategories
    if (subCategories && subCategories.length > 0) {
      for (let s = 0; s < subCategories.length; s++) {
        const sub = subCategories[s];
        await prisma.subCategory.create({
          data: {
            categoryId: created.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            imageUrl: sub.imageUrl,
            basePrice: sub.basePrice,
            durationMin: sub.durationMin,
            sortOrder: s,
          },
        });
      }
    }

    // Seed Fields
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      await prisma.categoryFieldDefinition.create({
        data: {
          categoryId: created.id,
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options ? f.options : undefined,
          placeholder: f.placeholder,
          sortOrder: i,
        },
      });
    }

    await prisma.commissionRule.create({
      data: {
        categoryId: created.id,
        percentage: catData.commissionRate,
        minFee: 5000,
      },
    });
  }

  // 3. Admin & Support
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@serviqa.com',
      name: 'System Administrator',
      phone: '+919999000001',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  const supportUser = await prisma.user.create({
    data: {
      email: 'support@serviqa.com',
      name: 'Customer Support Lead',
      phone: '+919999000002',
      passwordHash,
      role: UserRole.SUPPORT_STAFF,
    },
  });

  // 4. Customers
  const customerUser1 = await prisma.user.create({
    data: {
      email: 'rahul.sharma@example.com',
      name: 'Rahul Sharma',
      phone: '+919876543210',
      passwordHash,
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          referralCode: 'RAHUL77',
          loyaltyPoints: 120,
        },
      },
    },
    include: { customerProfile: true },
  });

  const addressRahul = await prisma.address.create({
    data: {
      userId: customerUser1.id,
      serviceAreaId: areaMumbai.id,
      title: 'HOME',
      addressLine: 'Flat 402, Tower B, Orchid Heights, Malad Link Road',
      landmark: 'Opposite Inorbit Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400064',
      isDefault: true,
      latitude: 19.186,
      longitude: 72.8485,
    },
  });

  const addressRahulWork = await prisma.address.create({
    data: {
      userId: customerUser1.id,
      serviceAreaId: areaMumbai.id,
      title: 'WORK',
      addressLine: '6th Floor, Suite 604, Mindspace IT Park, Building 9',
      landmark: 'Behind Hypercity',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400064',
      isDefault: false,
      latitude: 19.173,
      longitude: 72.836,
    },
  });

  const addressRahulOther = await prisma.address.create({
    data: {
      userId: customerUser1.id,
      serviceAreaId: areaMumbai.id,
      title: 'OTHER',
      addressLine: 'Bungalow 14, Shanti Nagar, Andheri West',
      landmark: 'Near Lokhandwala Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400053',
      isDefault: false,
      latitude: 19.136,
      longitude: 72.827,
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'priya.patel@example.com',
      name: 'Priya Patel',
      phone: '+919876543211',
      passwordHash,
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          referralCode: 'PRIYA88',
          loyaltyPoints: 340,
        },
      },
    },
    include: { customerProfile: true },
  });

  const addressPriya = await prisma.address.create({
    data: {
      userId: customerUser2.id,
      serviceAreaId: areaBangalore.id,
      title: 'HOME',
      addressLine: '12th Main, 100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      isDefault: true,
      latitude: 12.9784,
      longitude: 77.6408,
    },
  });

  // 5. Verified Service Providers
  const providerUser1 = await prisma.user.create({
    data: {
      email: 'rajesh.ac@example.com',
      name: 'Rajesh Kumar',
      phone: '+919811223344',
      passwordHash,
      role: UserRole.PROVIDER,
      providerProfile: {
        create: {
          businessName: 'CoolCare HVAC & Appliance Solutions',
          bio: '12+ years of certified experience in DAIKIN, Voltas, Hitachi AC repair, deep gas charging, and PCB micro-soldering.',
          experienceYears: 12,
          verificationStatus: VerificationStatus.VERIFIED,
          serviceRadiusKm: 25.0,
          latitude: 19.186,
          longitude: 72.8485,
          averageRating: 4.9,
          totalReviews: 86,
          completedJobsCount: 142,
          isAvailable: true,
          payoutAccountNumber: '984512004532',
          payoutIfscCode: 'HDFC0001234',
        },
      },
    },
    include: { providerProfile: true },
  });

  await prisma.providerVerification.createMany({
    data: [
      {
        providerId: providerUser1.providerProfile!.id,
        documentType: 'Aadhaar Card (Government Identity)',
        documentNumber: 'XXXX-XXXX-8921',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        status: VerificationStatus.VERIFIED,
        verifiedAt: new Date('2026-10-15'),
        verifiedBy: adminUser.id,
      },
      {
        providerId: providerUser1.providerProfile!.id,
        documentType: 'PAN Card (Tax & Payout Ledger)',
        documentNumber: 'ABCDE9821F',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        status: VerificationStatus.VERIFIED,
        verifiedAt: new Date('2026-10-15'),
        verifiedBy: adminUser.id,
      },
      {
        providerId: providerUser1.providerProfile!.id,
        documentType: 'HVAC Master Trade & ITI Skill Certificate',
        documentNumber: 'ITI-MH-2018-84920',
        fileUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80',
        status: VerificationStatus.VERIFIED,
        verifiedAt: new Date('2026-10-18'),
        verifiedBy: adminUser.id,
      },
      {
        providerId: providerUser1.providerProfile!.id,
        documentType: 'Police Background Verification Certificate',
        documentNumber: 'MUM-POL-2026-0914',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
        status: VerificationStatus.VERIFIED,
        verifiedAt: new Date('2026-10-20'),
        verifiedBy: adminUser.id,
      },
    ],
  });

  await prisma.providerService.createMany({
    data: [
      { providerId: providerUser1.providerProfile!.id, categoryId: createdCategories['ac-repair'].id },
      { providerId: providerUser1.providerProfile!.id, categoryId: createdCategories['appliance-repair'].id },
      { providerId: providerUser1.providerProfile!.id, categoryId: createdCategories['ro-water-purifier'].id },
    ],
  });

  const providerUser2 = await prisma.user.create({
    data: {
      email: 'vikram.movers@example.com',
      name: 'Vikram Singh',
      phone: '+919822334455',
      passwordHash,
      role: UserRole.PROVIDER,
      providerProfile: {
        create: {
          businessName: 'Speedy Logistics & Safe Packers',
          bio: 'Licensed fleet of hydraulic tail-lift trucks, trained packing staff, high-grade corrugated sheets, and transit insurance.',
          experienceYears: 9,
          verificationStatus: VerificationStatus.VERIFIED,
          serviceRadiusKm: 40.0,
          latitude: 28.5300,
          longitude: 77.2000,
          averageRating: 4.8,
          totalReviews: 64,
          completedJobsCount: 98,
          isAvailable: true,
        },
      },
    },
    include: { providerProfile: true },
  });

  await prisma.providerVerification.create({
    data: {
      providerId: providerUser2.providerProfile!.id,
      documentType: 'GST Registration Certificate',
      documentNumber: '07AAAAA0000A1Z5',
      fileUrl: '/uploads/verification/speedy_gst.pdf',
      status: VerificationStatus.VERIFIED,
      verifiedAt: new Date('2026-02-10'),
      verifiedBy: adminUser.id,
    },
  });

  await prisma.providerService.create({
    data: { providerId: providerUser2.providerProfile!.id, categoryId: createdCategories['packers-movers'].id },
  });

  const providerUser3 = await prisma.user.create({
    data: {
      email: 'sunil.electric@example.com',
      name: 'Sunil Verma',
      phone: '+919833445566',
      passwordHash,
      role: UserRole.PROVIDER,
      providerProfile: {
        create: {
          businessName: 'Spark Plumbing & Electrical Care',
          bio: 'Licensed wireman and certified sanitary technician. 8 years serving residential high-rises.',
          experienceYears: 8,
          verificationStatus: VerificationStatus.VERIFIED,
          serviceRadiusKm: 15.0,
          latitude: 12.9716,
          longitude: 77.5946,
          averageRating: 4.9,
          totalReviews: 42,
          completedJobsCount: 79,
          isAvailable: true,
        },
      },
    },
    include: { providerProfile: true },
  });

  await prisma.providerService.createMany({
    data: [
      { providerId: providerUser3.providerProfile!.id, categoryId: createdCategories['electricians'].id },
      { providerId: providerUser3.providerProfile!.id, categoryId: createdCategories['plumbing'].id },
      { providerId: providerUser3.providerProfile!.id, categoryId: createdCategories['carpentry'].id },
    ],
  });

  await prisma.providerVerification.create({
    data: {
      providerId: providerUser3.providerProfile!.id,
      documentType: 'Government Wireman Trade License & Competency Certificate',
      documentNumber: 'MH-ELEC-2026-89420',
      fileUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80',
      status: VerificationStatus.PENDING,
    },
  });

  // 6. Rewards & Recognition
  const rewardProgram = await prisma.rewardProgram.create({
    data: {
      name: 'Monthly Excellence & Customer Trust Awards',
      monthYear: '2026-10',
      isActive: true,
    },
  });

  await prisma.rewardRule.createMany({
    data: [
      { programId: rewardProgram.id, category: RewardCategory.SERVICE_STAR, minJobs: 15, minRating: 4.8, weightJobs: 0.30, weightRating: 0.25, weightPunctuality: 0.20, weightQuality: 0.15, weightConduct: 0.10, cashPrize: 1000000 },
      { programId: rewardProgram.id, category: RewardCategory.CUSTOMER_FAVOURITE, minJobs: 10, minRating: 4.9, weightJobs: 0.20, weightRating: 0.40, weightPunctuality: 0.20, weightQuality: 0.10, weightConduct: 0.10, cashPrize: 750000 },
      { programId: rewardProgram.id, category: RewardCategory.RELIABILITY_CHAMPION, minJobs: 20, minRating: 4.7, weightJobs: 0.25, weightRating: 0.20, weightPunctuality: 0.35, weightQuality: 0.10, weightConduct: 0.10, cashPrize: 500000 },
    ],
  });

  await prisma.achievementBadge.createMany({
    data: [
      {
        providerId: providerUser1.providerProfile!.id,
        badgeName: '50+ Flawless AC Servicing Jobs',
        icon: '❄️',
        description: 'Completed 50+ cooling diagnostics without a single customer recall or complaint.',
      },
      {
        providerId: providerUser1.providerProfile!.id,
        badgeName: 'Doorstep Punctuality Champion',
        icon: '⚡',
        description: 'Maintained 98%+ on-time arrival across Malad, Andheri, and Goregaon territory.',
      },
      {
        providerId: providerUser1.providerProfile!.id,
        badgeName: 'Zero Escrow Dispute Record',
        icon: '🛡️',
        description: '100% mutual customer sign-offs and zero warranty dispute claims for 6 months.',
      },
      {
        providerId: providerUser1.providerProfile!.id,
        badgeName: 'Top Rated 4.9+ Master Craftsman',
        icon: '⭐',
        description: 'Awarded by 40+ verified residential and commercial homeowners in Western Mumbai.',
      },
    ],
  });

  // Provider Settlements
  await prisma.providerSettlement.createMany({
    data: [
      {
        providerId: providerUser1.providerProfile!.id,
        amount: 4250000,
        status: 'PROCESSED',
        referenceId: 'NEFT-SRV-20261109-01',
        payoutDate: new Date('2026-11-09T00:35:00Z'),
      },
      {
        providerId: providerUser1.providerProfile!.id,
        amount: 1250000,
        status: 'PENDING',
        referenceId: 'NEFT-SRV-20261111-02',
      },
      {
        providerId: providerUser2.providerProfile!.id,
        amount: 2500000,
        status: 'PENDING',
        referenceId: 'NEFT-SRV-20261111-03',
      },
    ],
  });

  await prisma.consentRecord.create({
    data: {
      userId: providerUser1.id,
      purpose: 'SOCIAL_MEDIA_RECOGNITION',
      status: ConsentStatus.GRANTED,
      ipAddress: '127.0.0.1',
    },
  });

  const rajeshReward = await prisma.providerReward.create({
    data: {
      providerId: providerUser1.providerProfile!.id,
      programId: rewardProgram.id,
      category: RewardCategory.SERVICE_STAR,
      bonusAmount: 1000000,
      badgeEarned: 'Service Star of October 2026',
      certificateUrl: '/certificates/rajesh_star_oct2026.pdf',
    },
  });

  await prisma.socialRecognitionCampaign.create({
    data: {
      title: 'October Star Partner Spotlight: Rajesh Kumar',
      providerId: providerUser1.providerProfile!.id,
      rewardId: rajeshReward.id,
      draftCopy: 'Proud to recognize Rajesh Kumar from CoolCare HVAC! With 140+ completed bookings and a stellar 4.9 rating, Rajesh defines reliability and technical craftsmanship.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      isApproved: true,
      hasConsent: true,
      publishedAt: new Date('2026-10-25'),
    },
  });

  // 7. Completed Booking for AC Servicing
  const requestAC = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser1.customerProfile!.id,
      categoryId: createdCategories['ac-repair'].id,
      serviceAreaId: areaSouthDelhi.id,
      addressId: addressRahul.id,
      title: 'Split AC foam cleaning & gas pressure check',
      description: 'Daikin 1.5 ton split AC in master bedroom not cooling effectively. Need deep filter jet spray cleaning and gas pressure diagnostic.',
      customFieldValues: {
        acType: 'Split AC',
        capacityTons: '1.5 Ton',
        issueType: 'Not Cooling',
        needSpareParts: false,
      },
      preferredDate: new Date('2026-10-20'),
      timeSlot: 'Morning (09:00 - 12:00)',
      status: BookingStatus.COMPLETED,
    },
  });

  const quotationAC = await prisma.quotation.create({
    data: {
      requestId: requestAC.id,
      providerId: providerUser1.providerProfile!.id,
      totalAmount: 149900,
      status: QuotationStatus.ACCEPTED,
      estimatedHours: 2,
      notes: 'Includes jet pump indoor/outdoor unit wash, electrical circuit inspection, and R32 pressure top-up if required.',
      validUntil: new Date('2026-10-25'),
      lineItems: {
        create: [
          { description: 'High Pressure Foam Jet AC Service (Indoor + Outdoor)', quantity: 1, unitPrice: 99900, total: 99900 },
          { description: 'Refrigerant Gas Pressure Diagnostic & Top-up', quantity: 1, unitPrice: 50000, total: 50000 },
        ],
      },
    },
  });

  const bookingAC = await prisma.booking.create({
    data: {
      bookingNumber: 'SRV-2026-1001',
      requestId: requestAC.id,
      customerId: customerUser1.customerProfile!.id,
      providerId: providerUser1.providerProfile!.id,
      quotationId: quotationAC.id,
      addressId: addressRahul.id,
      status: BookingStatus.COMPLETED,
      scheduledDate: new Date('2026-10-20T10:00:00Z'),
      agreedAmount: 149900,
      platformFee: 17988,
      providerAmount: 131912,
      completionNotes: 'Cleaned indoor coils, washed outdoor condenser fins with foam spray. Cooling temperature restored to 16 deg C at air vents.',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingAC.id,
      amount: 149900,
      currency: 'INR',
      status: PaymentStatus.CAPTURED,
      paymentGateway: 'MANUAL_SANDBOX',
      gatewayTxnId: 'TXN_SANDBOX_AC_001',
      idempotencyKey: 'IDEMP_AC_001',
      paidAt: new Date('2026-10-20T12:30:00Z'),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingAC.id,
      customerId: customerUser1.customerProfile!.id,
      providerId: providerUser1.providerProfile!.id,
      rating: 5,
      comment: 'Super fast and clean work. Rajesh arrived right on time with high pressure pump equipment. My bedroom AC cools like new now!',
    },
  });

  // Booking 2: Confirmed Relocation for Rahul with Escrow Held
  const reqMoversRahul = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser1.customerProfile!.id,
      categoryId: createdCategories['packers-movers'].id,
      serviceAreaId: areaMumbai.id,
      addressId: addressRahul.id,
      title: '1 BHK Complete House Relocation',
      description: 'Relocating household goods from Malad West to Mindspace vicinity. Includes heavy furniture and electronics.',
      budgetMin: 800000,
      budgetMax: 1200000,
      preferredDate: new Date('2026-11-15'),
      timeSlot: 'Morning (08:00)',
      status: BookingStatus.CONFIRMED,
    },
  });

  const quoteMoversRahul = await prisma.quotation.create({
    data: {
      requestId: reqMoversRahul.id,
      providerId: providerUser2.providerProfile!.id,
      totalAmount: 950000,
      status: QuotationStatus.ACCEPTED,
      estimatedHours: 5,
      notes: 'Includes packaging materials, bubble wrapping, 14ft container truck, and 3 certified helpers.',
      validUntil: new Date('2026-11-20'),
      lineItems: {
        create: [
          { description: '1 BHK Shifting & Transportation', quantity: 1, unitPrice: 700000, total: 700000 },
          { description: 'Multi-layer Bubble & Box Packing', quantity: 1, unitPrice: 250000, total: 250000 },
        ],
      },
    },
  });

  const bookingMoversRahul = await prisma.booking.create({
    data: {
      bookingNumber: 'SRV-2026-0982',
      requestId: reqMoversRahul.id,
      customerId: customerUser1.customerProfile!.id,
      providerId: providerUser2.providerProfile!.id,
      quotationId: quoteMoversRahul.id,
      addressId: addressRahul.id,
      status: BookingStatus.CONFIRMED,
      scheduledDate: new Date('2026-11-15T09:00:00Z'),
      agreedAmount: 950000,
      platformFee: 114000,
      providerAmount: 836000,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingMoversRahul.id,
      amount: 950000,
      currency: 'INR',
      status: PaymentStatus.CAPTURED,
      paymentGateway: 'RAZORPAY_SANDBOX',
      gatewayTxnId: 'TXN_CARD_MOV_0912',
      idempotencyKey: 'IDEMP_MOV_0912',
      paidAt: new Date('2026-11-02T11:15:00Z'),
    },
  });

  // Booking 3: Completed Deep Cleaning for Rahul
  const reqCleaning = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser1.customerProfile!.id,
      categoryId: createdCategories['home-cleaning'].id,
      serviceAreaId: areaMumbai.id,
      addressId: addressRahul.id,
      title: 'Bathroom Deep Foam Descaling',
      description: 'Deep tile descaling, jet grout cleaning, and sanitary fitting mirror polishing.',
      budgetMin: 100000,
      budgetMax: 150000,
      preferredDate: new Date('2026-10-28'),
      timeSlot: 'Afternoon (14:00)',
      status: BookingStatus.COMPLETED,
    },
  });

  const quoteCleaning = await prisma.quotation.create({
    data: {
      requestId: reqCleaning.id,
      providerId: providerUser1.providerProfile!.id,
      totalAmount: 129900,
      status: QuotationStatus.ACCEPTED,
      estimatedHours: 2,
      notes: 'Industrial grade non-acidic descaling solution and rotary scrubbing.',
      validUntil: new Date('2026-11-01'),
      lineItems: {
        create: [
          { description: 'Bathroom Deep Foam Descaling Package', quantity: 1, unitPrice: 129900, total: 129900 },
        ],
      },
    },
  });

  const bookingCleaning = await prisma.booking.create({
    data: {
      bookingNumber: 'SRV-2026-0941',
      requestId: reqCleaning.id,
      customerId: customerUser1.customerProfile!.id,
      providerId: providerUser1.providerProfile!.id,
      quotationId: quoteCleaning.id,
      addressId: addressRahul.id,
      status: BookingStatus.COMPLETED,
      scheduledDate: new Date('2026-10-28T14:00:00Z'),
      agreedAmount: 129900,
      platformFee: 15588,
      providerAmount: 114312,
      completionNotes: 'Cleaned all tiles, mirrors, and shower glass. Customer inspected and verified satisfactory gloss finish.',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingCleaning.id,
      amount: 129900,
      currency: 'INR',
      status: PaymentStatus.CAPTURED,
      paymentGateway: 'UPI_PHONEPE',
      gatewayTxnId: 'TXN_UPI_CLN_0855',
      idempotencyKey: 'IDEMP_CLN_0855',
      paidAt: new Date('2026-10-28T16:00:00Z'),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingCleaning.id,
      customerId: customerUser1.customerProfile!.id,
      providerId: providerUser1.providerProfile!.id,
      rating: 5,
      comment: 'Sparkling clean tiles and zero chemical odor. Professional equipment used.',
    },
  });

  // Booking 4: Disputed Booking for Priya with Complaint
  const reqDisputed = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser2.customerProfile!.id,
      categoryId: createdCategories['electricians'].id,
      serviceAreaId: areaBangalore.id,
      addressId: addressPriya.id,
      title: 'MCB Tripping & Short Circuit Diagnostic',
      description: 'Main tripping repeatedly under load. Suspected loose wire or faulty breaker.',
      budgetMin: 150000,
      budgetMax: 250000,
      preferredDate: new Date('2026-11-08'),
      timeSlot: 'Morning (10:00)',
      status: BookingStatus.DISPUTED,
    },
  });

  const quoteDisputed = await prisma.quotation.create({
    data: {
      requestId: reqDisputed.id,
      providerId: providerUser3.providerProfile!.id,
      totalAmount: 210000,
      status: QuotationStatus.ACCEPTED,
      estimatedHours: 3,
      notes: 'Includes full distribution box check and 40A double pole MCB replacement.',
      validUntil: new Date('2026-11-12'),
      lineItems: {
        create: [
          { description: 'Electrical Diagnostics & Wire Testing', quantity: 1, unitPrice: 90000, total: 90000 },
          { description: 'Schneider Double Pole MCB & Busbar Fitting', quantity: 1, unitPrice: 120000, total: 120000 },
        ],
      },
    },
  });

  const bookingDisputed = await prisma.booking.create({
    data: {
      bookingNumber: 'SRV-2026-0915',
      requestId: reqDisputed.id,
      customerId: customerUser2.customerProfile!.id,
      providerId: providerUser3.providerProfile!.id,
      quotationId: quoteDisputed.id,
      addressId: addressPriya.id,
      status: BookingStatus.DISPUTED,
      scheduledDate: new Date('2026-11-08T10:00:00Z'),
      agreedAmount: 210000,
      platformFee: 25200,
      providerAmount: 184800,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingDisputed.id,
      amount: 210000,
      currency: 'INR',
      status: PaymentStatus.CAPTURED,
      paymentGateway: 'RAZORPAY_SANDBOX',
      gatewayTxnId: 'TXN_DISP_ELEC_0915',
      idempotencyKey: 'IDEMP_DISP_0915',
      paidAt: new Date('2026-11-08T10:30:00Z'),
    },
  });

  await prisma.complaint.create({
    data: {
      bookingId: bookingDisputed.id,
      customerId: customerUser2.customerProfile!.id,
      subject: 'Unsatisfactory wiring finish & overcharged parts',
      description: 'Technician left exposed insulation tape and replaced MCB without showing original bill or warranty card. Requesting re-inspection.',
      status: 'OPEN',
    },
  });

  // Booking 5: In-Progress Booking with Price Revision
  const reqInProgress = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser2.customerProfile!.id,
      categoryId: createdCategories['ac-repair'].id,
      serviceAreaId: areaBangalore.id,
      addressId: addressPriya.id,
      title: 'Commercial Cassette AC Diagnostic',
      description: 'Ceiling cassette AC fan is running but compressor does not start. Water dripping noticed.',
      budgetMin: 300000,
      budgetMax: 500000,
      preferredDate: new Date('2026-11-11'),
      timeSlot: 'Morning (11:00)',
      status: BookingStatus.IN_PROGRESS,
    },
  });

  const quoteInProgress = await prisma.quotation.create({
    data: {
      requestId: reqInProgress.id,
      providerId: providerUser1.providerProfile!.id,
      totalAmount: 350000,
      status: QuotationStatus.ACCEPTED,
      estimatedHours: 3,
      notes: 'Diagnostic, drain pump cleaning, and electrical contactor check.',
      validUntil: new Date('2026-11-15'),
      lineItems: {
        create: [
          { description: 'Cassette AC Contactor & Diagnostic Service', quantity: 1, unitPrice: 350000, total: 350000 },
        ],
      },
    },
  });

  const bookingInProgress = await prisma.booking.create({
    data: {
      bookingNumber: 'SRV-2026-1022',
      requestId: reqInProgress.id,
      customerId: customerUser2.customerProfile!.id,
      providerId: providerUser1.providerProfile!.id,
      quotationId: quoteInProgress.id,
      addressId: addressPriya.id,
      status: BookingStatus.IN_PROGRESS,
      scheduledDate: new Date('2026-11-11T11:00:00Z'),
      agreedAmount: 350000,
      platformFee: 42000,
      providerAmount: 308000,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingInProgress.id,
      amount: 350000,
      currency: 'INR',
      status: PaymentStatus.CAPTURED,
      paymentGateway: 'RAZORPAY_SANDBOX',
      gatewayTxnId: 'TXN_INPROG_AC_1022',
      idempotencyKey: 'IDEMP_INPROG_1022',
      paidAt: new Date('2026-11-11T11:10:00Z'),
    },
  });

  await prisma.bookingPriceRevision.create({
    data: {
      bookingId: bookingInProgress.id,
      addedAmount: 85000,
      reason: 'Replaced rusted condenser valve and added nitrogen flush to clear blocked drain trap.',
      isApproved: false,
    },
  });

  // 8. Active Relocation Request
  const requestMovers = await prisma.serviceRequest.create({
    data: {
      customerId: customerUser2.customerProfile!.id,
      categoryId: createdCategories['packers-movers'].id,
      serviceAreaId: areaBangalore.id,
      addressId: addressPriya.id,
      title: '2 BHK Apartment Relocation (Indiranagar to Whitefield)',
      description: 'Moving home furniture including 1 king bed, 2 wardrobes, 55-inch OLED TV, dining table, and kitchen utensils.',
      customFieldValues: {
        moveSize: '2 BHK',
        pickupFloor: 3,
        pickupLift: true,
        dropFloor: 5,
        dropLift: true,
        fragileItems: '55-inch OLED TV, glass dining table top, ceramic crockery crates',
      },
      budgetMin: 800000,
      budgetMax: 1400000,
      preferredDate: new Date('2026-11-05'),
      timeSlot: 'Morning (08:00)',
      status: BookingStatus.QUOTATIONS_RECEIVED,
    },
  });

  await prisma.quotation.create({
    data: {
      requestId: requestMovers.id,
      providerId: providerUser2.providerProfile!.id,
      totalAmount: 1150000,
      status: QuotationStatus.SUBMITTED,
      estimatedHours: 6,
      notes: 'Package includes 5-layer bubble packing for TV & glass, 14-ft covered truck, dismantling and reassembly of bed, and transit toll/entry fees.',
      validUntil: new Date('2026-11-04'),
      lineItems: {
        create: [
          { description: 'Dedicated 14ft Covered Truck Transport & Fuel', quantity: 1, unitPrice: 450000, total: 450000 },
          { description: 'Professional Packing Materials (Bubble Wrap, Foam, Corrugated Boxes)', quantity: 1, unitPrice: 350000, total: 350000 },
          { description: 'Labor (4 Trained Movers for Loading, Dismantling & Unloading)', quantity: 4, unitPrice: 75000, total: 300000 },
          { description: 'Transit Goods Insurance Protection', quantity: 1, unitPrice: 50000, total: 50000 },
        ],
      },
    },
  });

  console.log('Database seeded with rich categories, photography, and subcategories!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
