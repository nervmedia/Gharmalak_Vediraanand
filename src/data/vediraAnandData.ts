export interface ApartmentConfig {
  id: '2bhk' | '3bhk';
  name: string;
  badge: string;
  floors: string;
  flats: string;
  superBuiltUpAreaSqFt: number; // Strictly labeled Super Built-Up / S-B/UP area, NOT carpet area
  areaLabel: string;
  pricingLabel: string;
  tagline: string;
  description: string;
  highlights: string[];
  roomDimensions: {
    room: string;
    dimension: string;
    features?: string;
  }[];
  floorPlanImage: string;
  isometricImage?: string;
}

export interface SpecificationCategory {
  id: string;
  number: number;
  title: string;
  highlight: string;
  description: string;
}

export interface ProjectAmenity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export interface LandmarkDistance {
  name: string;
  distance: string;
  time: string;
  category: 'Tech & Work' | 'Education' | 'Transit' | 'Healthcare' | 'Shopping & Leisure';
}

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | 'All'
    | 'Project Elevation'
    | '2 BHK Floor Plan'
    | '2 BHK Isometric View'
    | '3 BHK Floor Plan'
    | 'Parking and Entrance'
    | 'Specifications and Amenities'
    | 'Location';
  src: string;
  alt: string;
  caption: string;
  isFloorPlan?: boolean;
}

export const VEDIRA_ANAND_DATA = {
  projectName: 'Vedira Anand',
  developerName: 'WallStone Realty Pvt. Ltd.',
  tagline: 'A Scheme of 2 & 3 BHK Luxurious Flats',
  locationBrief: 'Gopal Nagar, Nagpur',
  address: 'Plot No. 8, Dr. Padhan Layout, 3rd Bus Stop, Gopal Nagar, Nagpur – 440001',
  googleMapsQuery: 'Plot No. 8, Dr. Padhan Layout, 3rd Bus Stop, Gopal Nagar, Nagpur, Maharashtra 440001',
  statusBadge: 'Exclusive Gharmalak Featured Deal',
  priceLabel: 'Price on Request',
  structureInfo: 'Ground Floor + 6 Residential Floors',
  totalConfigurations: '2 & 3 BHK Apartments',
  superBuiltUpRange: '1,292 – 2,190 sq. ft. S-B/UP',
  brochurePdfUrl: '/assets/aistudio/Vedira_Anand_Brochure__c18c8244.pdf',
  brochureDownloadUrl: '/downloads/Vedira_Anand_Project_Brochure.pdf',
  brochureFileName: 'Vedira_Anand_Project_Brochure.pdf',

  quickStats: [
    { label: 'Project Name', value: 'Vedira Anand' },
    { label: 'Developer', value: 'WallStone Realty Pvt. Ltd.' },
    { label: 'Location', value: 'Gopal Nagar, Nagpur' },
    { label: 'Configurations', value: '2 & 3 BHK Luxurious Flats' },
    { label: 'Structure', value: 'G + 6 Floors' },
    { label: 'S-B/UP Area Range', value: '1,292 & 2,190 sq. ft.' },
    { label: 'Price', value: 'Price on Request' },
    { label: 'Parking', value: 'Hydraulic Stacker Parking' },
  ],

  configurations: [
    {
      id: '2bhk',
      name: '2 BHK Luxury Apartment',
      badge: '1st to 5th Floor · Flats 101–501 & 102–502',
      floors: 'Typical 1st to 5th floors',
      flats: '101–501 and 102–502 (Two flats per floor)',
      superBuiltUpAreaSqFt: 1292,
      areaLabel: '1,292 sq. ft. (S-B/UP Area)',
      pricingLabel: 'Price on Request',
      tagline: 'Thoughtfully planned 2 BHK homes with excellent cross-ventilation and zero space wastage.',
      description:
        'Ideal for modern families seeking a balanced urban retreat. Includes an expansive drawing hall with attached balcony, master bedroom with en-suite toilet, cozy second bedroom, and a fully functional kitchen and dining with dedicated utility wash.',
      highlights: [
        'Super Built-Up Area: 1,292 sq. ft.',
        'East / West Vastu-friendly orientations',
        'Large sit-out balconies with panoramic neighborhood views',
        'Concealed electrification with modular switches and inverter point',
        'Gypsum plaster with warm interior false ceiling',
      ],
      roomDimensions: [
        {
          room: 'Drawing Hall',
          dimension: `16'10" × 11'0"`,
          features: 'Open layout with attached sit-out balcony and gypsum false ceiling',
        },
        {
          room: 'Master Bedroom',
          dimension: `11'0" × 12'0"`,
          features: `Attached 4' wide balcony and en-suite toilet (4'1" × 7'0")`,
        },
        {
          room: 'Master Toilet',
          dimension: `4'1" × 7'0"`,
          features: 'Jaquar CP fittings, single-lever diverter, 7 ft glazed wall tiles',
        },
        {
          room: 'Bedroom 2',
          dimension: `11'0" × 12'0"`,
          features: `Attached 4'0" wide balcony and powder-coated window with safety grill`,
        },
        {
          room: 'Common Toilet',
          dimension: `8'0" × 4'0"`,
          features: 'Designer anti-skid floor tiles and dual-flush water-saving sanitary ware',
        },
        {
          room: 'Kitchen & Dining',
          dimension: `8'3" × 15'4"`,
          features: 'Granite counter, SS sink, water purifier & exhaust provisions',
        },
        {
          room: 'Wash Balcony',
          dimension: `5'0" Wide Wash`,
          features: 'Washing machine inlet-outlet with anti-skid ceramic tiles',
        },
        {
          room: 'Floor Landing & Staircase',
          dimension: `8'0" × 6'0"`,
          features: `Automatic lift (5' × 6') and 4' wide main landing`,
        },
      ],
      floorPlanImage: '/images/vedira-anand/page_2.png',
      isometricImage: '/images/vedira-anand/page_3.png',
    },
    {
      id: '3bhk',
      name: '3 BHK Penthouse Suite',
      badge: '6th Floor · Flat 601 Exclusive',
      floors: 'Typical 6th floor',
      flats: 'Flat 601 (Exclusive single expansive layout)',
      superBuiltUpAreaSqFt: 2190,
      areaLabel: '2,190 sq. ft. (S-B/UP Area)',
      pricingLabel: 'Price on Request',
      tagline: 'A regal top-floor 3 BHK residence boasting an immense 2,190 sq. ft. footprint with an expansive terrace.',
      description:
        'Occupying the prestigious 6th floor, this grand apartment provides unmatched privacy, double-width living-dining quarters, three expansive bedrooms with en-suite bathrooms, a gourmet chef kitchen with store and pooja room, and direct access to open sit-out terrace spaces.',
      highlights: [
        'Super Built-Up Area: 2,190 sq. ft.',
        'Top floor vantage point with elevated cross-breezes and skyline views',
        'Expansive 16\'10" × 15\'6" drawing hall with wide sit-out',
        'Private 7\'10" wide open-air terrace sit-out and three private balconies',
        'Dedicated pooja room (4\'10" × 4\'11") and store room (4\'4" × 7\'1")',
      ],
      roomDimensions: [
        {
          room: 'Drawing Hall',
          dimension: `16'10" × 15'6"`,
          features: `Spacious entertaining hall opening onto 7'10" wide open sit-out deck`,
        },
        {
          room: 'Dining Area',
          dimension: `11'1" × 7'10"`,
          features: 'Central family dining space with direct access to kitchen',
        },
        {
          room: 'Master Bedroom 1',
          dimension: `15'6" × 15'0"`,
          features: `King-sized suite with walk-in closet, toilet (5'8" × 8'0"), and 4' wide balcony`,
        },
        {
          room: 'Master Toilet 1',
          dimension: `5'8" × 8'0"`,
          features: 'Premium counter-top basin, thermostatic diverter, 7 ft wall tiles',
        },
        {
          room: 'Master Bedroom 2',
          dimension: `11'0" × 12'0"`,
          features: `Attached 4' wide balcony and private toilet (4'0" × 7'0")`,
        },
        {
          room: 'Bedroom 3',
          dimension: `15'2" × 12'0"`,
          features: `Corner room with attached 4'0" wide balcony and toilet (8'0" × 4'0")`,
        },
        {
          room: 'Pooja Room',
          dimension: `4'10" × 4'11"`,
          features: 'Vastu-compliant peaceful sacred sanctuary with marble niche',
        },
        {
          room: 'Kitchen & Store',
          dimension: `8'3" × 10'10" + Store 4'4" × 7'1"`,
          features: `Granite counter, deep SS sink, chimney duct, and 5'0" wide wash balcony`,
        },
        {
          room: 'Terrace Sit-Out',
          dimension: `7'10" Wide Sit-Out`,
          features: 'Open-air balcony deck with SS and toughened glass safety railing',
        },
      ],
      floorPlanImage: '/images/vedira-anand/page_4.png',
    },
  ] as ApartmentConfig[],

  // 16 verified specifications from Page 5 of the WallStone Realty brochure
  specifications: [
    {
      id: 'structure',
      number: 1,
      title: 'Structure',
      highlight: 'Earthquake-Resistant RCC Frame',
      description:
        'Engineered to meet Bureau of Indian Standards seismic zone criteria with high-grade Fe550 TMT steel and M25/M30 grade concrete.',
    },
    {
      id: 'wall',
      number: 2,
      title: 'Wall Masonry',
      highlight: '6" External & 4" Internal Walls',
      description:
        'External 6-inch high-density fly ash/clay brick walls for thermal insulation; internal 4-inch brick walls with acoustic dampening.',
    },
    {
      id: 'plaster',
      number: 3,
      title: 'Plaster',
      highlight: 'Sand-Faced External & Smooth Gypsum Internal',
      description:
        'Double-coat sand-faced waterproof cement plaster on exterior facades; velvety smooth gypsum/neeru plaster finish on internal walls.',
    },
    {
      id: 'paint',
      number: 4,
      title: 'Paint & Finishes',
      highlight: 'Premium Acrylic Emulsion & Weather-Shield Exterior',
      description:
        'Washable interior acrylic emulsion with rich finish; weather-proof exterior silicon emulsion protecting against monsoon rains.',
    },
    {
      id: 'windows',
      number: 5,
      title: 'Windows',
      highlight: 'Powder-Coated Aluminum Sliding with Mosquito Mesh',
      description:
        'Heavy-duty sliding aluminum windows fitted with stainless steel mosquito net panels, polished granite window sills, and protective MS safety grills.',
    },
    {
      id: 'doors',
      number: 6,
      title: 'Doors & Locks',
      highlight: 'Laminated Main Door with Digital Thumbprint Lock',
      description:
        'Attractive designer laminated wooden main entrance door with digital biometric thumbprint lock; waterproof flush internal doors with cylindrical brass mortise locks.',
    },
    {
      id: 'kitchen',
      number: 7,
      title: 'Kitchen Platform',
      highlight: 'Black Granite with SS Sink & Glazed Tiles to Lintel',
      description:
        'Polished jet-black granite cooking platform with deep stainless-steel sink, ceramic wall tiles up to 7 ft lintel height, and electrical/plumbing points for RO water purifier and exhaust fan.',
    },
    {
      id: 'electrification',
      number: 8,
      title: 'Electrification',
      highlight: 'Concealed Copper Wiring with Modular Switches',
      description:
        'Polycab/Finolex fire-retardant concealed copper wiring, Legrand/Schneider modular switches, AC electrical points in all bedrooms, TV/cable provisions, and integrated inverter battery backup wiring.',
    },
    {
      id: 'toilets',
      number: 9,
      title: 'Toilets & Plumbing',
      highlight: 'Anti-Skid Flooring & 7 ft Designer Dado Tiles',
      description:
        'Anti-skid ceramic floor tiling, full-height glazed designer wall tiles up to 7 feet, concealed corrosion-resistant CPVC/UPVC piping, and solar hot water provisions.',
    },
    {
      id: 'bathroom-fixtures',
      number: 10,
      title: 'Bathroom Fixtures',
      highlight: 'Branded Jaquar / Kohler CP Fittings',
      description:
        'Premium single-lever hot & cold diverters, overhead showers, and chrome-plated brass bib taps from Jaquar/Kohler or equivalent reputed manufacturers.',
    },
    {
      id: 'sanitary-ware',
      number: 11,
      title: 'Sanitary Ware',
      highlight: 'Cera / Hindware Dual-Flush Cisterns',
      description:
        'Wall-hung or floor-mounted European water closets with dual-flush water-saving systems and matching ceramic counter-top wash basins.',
    },
    {
      id: 'water-supply',
      number: 12,
      title: 'Water Supply',
      highlight: '24-Hour Automated Supply with Dual Storage',
      description:
        'Adequate underground and overhead RCC water storage tanks fitted with automated electronic water level controllers connecting municipal supply and borewell backup.',
    },
    {
      id: 'railings',
      number: 13,
      title: 'Balcony & Staircase Railings',
      highlight: 'SS 304 Grade with Toughened Safety Glass',
      description:
        'Corrosion-resistant stainless-steel handrails complemented with toughened architectural safety glass on all balconies and staircases.',
    },
    {
      id: 'lift',
      number: 14,
      title: 'Lift / Automatic Elevator',
      highlight: '6-Passenger High-Speed Lift with ARD Backup',
      description:
        'Reputed make (Otis/Kone) automatic 6-passenger elevator with automatic rescue device (ARD) to safely guide passengers to nearest floor during power cuts.',
    },
    {
      id: 'parking',
      number: 15,
      title: 'Car Parking',
      highlight: 'Modern Ground-Floor Hydraulic Stacker System',
      description:
        'Demarcated covered and open ground-floor vehicle parking bays equipped with hydraulic multi-tier stackers for efficient, safe vehicle placement.',
    },
    {
      id: 'waterproofing',
      number: 16,
      title: 'Waterproofing',
      highlight: 'Multi-Coat Elastomer Chemical Treatment',
      description:
        'Specialized chemical waterproofing membrane applied to terrace slab, balconies, bathroom floors, and sunken areas with multi-year leak-free warranty.',
    },
  ] as SpecificationCategory[],

  // 11 Special Features and Amenities from Page 5
  specialFeatures: [
    {
      id: 'vastu',
      title: 'Vastu-Compliant Design',
      subtitle: 'Positive Energy Flow',
      description: 'Architecturally balanced spatial layout planned according to authentic Vastu Shastra principles for prosperity and wellness.',
      iconName: 'Compass',
    },
    {
      id: 'ceiling',
      title: 'Gypsum False Ceiling',
      subtitle: 'Warm Ambient Lighting',
      description: 'Velvet-smooth gypsum plaster ceiling in the living hall with concealed cove lighting channels for a warm, luxurious glow.',
      iconName: 'Sparkles',
    },
    {
      id: 'inverter',
      title: 'Inverter Battery Backup',
      subtitle: 'Uninterrupted Comfort',
      description: 'Pre-wired dedicated inverter circuitry connecting essential lighting, fans, and Wi-Fi routers inside every apartment.',
      iconName: 'Zap',
    },
    {
      id: 'smart-lock',
      title: 'Thumbprint Digital Lock',
      subtitle: 'Keyless Smart Security',
      description: 'High-security biometric thumbprint, RFID card, and digital PIN access lock installed on the solid main entrance door.',
      iconName: 'Fingerprint',
    },
    {
      id: 'terrace-garden',
      title: 'Landscaped Terrace Garden',
      subtitle: 'Scenic Open Spaces',
      description: 'A manicured rooftop garden retreat with pedestrian pavers, ornamental plants, and fresh open-air seating for residents.',
      iconName: 'Trees',
    },
    {
      id: 'hydraulic-parking',
      title: 'Hydraulic Car Parking',
      subtitle: 'Multi-Level Stacker System',
      description: 'Engineered hydraulic stacker system maximizing vehicle safety and ease of parking on the ground level.',
      iconName: 'Car',
    },
    {
      id: 'solar-panel',
      title: '5 kW Rooftop Solar PV',
      subtitle: 'Eco-Friendly Energy Savings',
      description: '5 kW grid-connected common rooftop solar photovoltaic system slashing building electricity bills and powering common lights.',
      iconName: 'Sun',
    },
    {
      id: 'video-doorbell',
      title: 'Smart Video Doorbell',
      subtitle: 'Two-Way Audio & Video',
      description: 'High-definition color camera and indoor monitor screen enabling visitors to be screened conveniently from inside the home.',
      iconName: 'Video',
    },
    {
      id: 'ev-charging',
      title: 'EV Charging Points',
      subtitle: 'Future-Ready Green Mobility',
      description: 'Dedicated electric vehicle charging connection infrastructure in the parking area for electric cars and two-wheelers.',
      iconName: 'BatteryCharging',
    },
    {
      id: 'cctv',
      title: '24×7 CCTV Surveillance',
      subtitle: 'Round-The-Clock Security',
      description: 'Night-vision high-definition CCTV coverage across entrance gates, ground parking, elevator lobby, and rooftop amenities.',
      iconName: 'ShieldCheck',
    },
    {
      id: 'gazebo',
      title: 'Rooftop Gazebo Pavilion',
      subtitle: 'Elevated Community Lounge',
      description: 'Architectural weather-proof shaded gazebo with comfortable seating for evening conversations and panoramic sunset views.',
      iconName: 'Coffee',
    },
  ] as ProjectAmenity[],

  // Strategic connectivity in Gopal Nagar, Nagpur
  landmarks: [
    {
      name: 'VNIT Nagpur Campus',
      distance: '1.2 km',
      time: '4 mins',
      category: 'Education',
    },
    {
      name: 'IT Park Nagpur (Gayatri Nagar / Parsodi)',
      distance: '1.8 km',
      time: '6 mins',
      category: 'Tech & Work',
    },
    {
      name: 'Pratap Nagar Square & Ring Road',
      distance: '1.0 km',
      time: '3 mins',
      category: 'Transit',
    },
    {
      name: 'Subhash Nagar Metro Station',
      distance: '1.5 km',
      time: '5 mins',
      category: 'Transit',
    },
    {
      name: 'Shankar Nagar & Bajaj Nagar Squares',
      distance: '2.5 km',
      time: '7 mins',
      category: 'Shopping & Leisure',
    },
    {
      name: 'Leading Schools (BVM, Centre Point, Somalwar)',
      distance: '1.8 – 3.0 km',
      time: '6–8 mins',
      category: 'Education',
    },
    {
      name: 'Major Hospitals (Orange City & Viveka)',
      distance: '1.5 – 2.5 km',
      time: '5–7 mins',
      category: 'Healthcare',
    },
    {
      name: 'Dr. Babasaheb Ambedkar International Airport',
      distance: '6.5 km',
      time: '15 mins',
      category: 'Transit',
    },
  ] as LandmarkDistance[],

  // Gallery items categorized with interactive modal support
  gallery: [
    {
      id: 'elevation-1',
      title: 'Architectural Building Elevation',
      category: 'Project Elevation',
      src: '/assets/aistudio/image_dc17df3b.png',
      alt: 'Vedira Anand 6-Storey Full Front Building Elevation',
      caption: 'Complete front elevation of Vedira Anand against dark blue sky, highlighting illuminated balconies, G+6 residential floors, and ground entrance.',
    },
    {
      id: 'floor-plan-2bhk',
      title: '2 BHK Typical Floor Plan (1st to 5th Floor)',
      category: '2 BHK Floor Plan',
      src: '/images/vedira-anand/page_2.png',
      alt: '2 BHK Floor Plan Vedira Anand 1292 sq ft Super Built-Up Area',
      caption: 'Original brochure Page 2: 1,292 sq. ft. S-B/UP area layout with drawing hall, master bed with 4\' balcony, bed room 2, kitchen & dining, wash balcony.',
      isFloorPlan: true,
    },
    {
      id: 'isometric-2bhk',
      title: '2 BHK 3D Isometric View & Cutaway',
      category: '2 BHK Isometric View',
      src: '/images/vedira-anand/page_3.png',
      alt: '2 BHK Isometric Cutaway 3D Interior Layout',
      caption: 'Original brochure Page 3: Three-dimensional perspective showing full apartment furniture layout and ground floor hydraulic car parking.',
      isFloorPlan: true,
    },
    {
      id: 'floor-plan-3bhk',
      title: '3 BHK Penthouse Floor Plan (6th Floor)',
      category: '3 BHK Floor Plan',
      src: '/images/vedira-anand/page_4.png',
      alt: '3 BHK Floor Plan Flat 601 Vedira Anand 2190 sq ft Super Built-Up Area',
      caption: 'Original brochure Page 4: Prestigious 2,190 sq. ft. S-B/UP top-floor residence featuring 16\'10" × 15\'6" drawing hall, 3 suites, pooja, store, and sit-out terrace.',
      isFloorPlan: true,
    },
    {
      id: 'parking-entrance',
      title: 'Ground Floor Hydraulic Parking & Entrance',
      category: 'Parking and Entrance',
      src: '/images/vedira-anand/page_3.png',
      alt: 'Hydraulic Stacker Car Parking and Ground Floor Entrance',
      caption: 'Original brochure Page 3: Ground floor plan with 9m wide road entrance, automated gates, and hydraulic multi-level parking stackers.',
    },
    {
      id: 'specifications-solar',
      title: '5 kW Rooftop Solar & Terrace Amenities',
      category: 'Specifications and Amenities',
      src: '/images/rooftop-solar.jpg',
      alt: 'Common Rooftop 5 kW Solar Installation',
      caption: 'High-efficiency 5 kW photovoltaic solar panels providing green electricity for common lighting, lift, and pump operations.',
    },
    {
      id: 'specifications-kitchen',
      title: 'Kitchen Platform & Quality Finishes',
      category: 'Specifications and Amenities',
      src: '/images/modular-kitchen.jpg',
      alt: 'Polished Granite Kitchen Platform and Glazed Wall Tiles',
      caption: 'Polished black granite counter, stainless-steel sink, and provisions for modern chimney and water purifiers.',
    },
    {
      id: 'cctv-smart-security',
      title: 'Smart Video Security & CCTV Coverage',
      category: 'Specifications and Amenities',
      src: '/images/cctv-security.jpg',
      alt: 'Smart Video Doorbell and 24x7 CCTV Surveillance',
      caption: 'Biometric thumbprint door lock, smart intercom video doorbell, and comprehensive high-definition security camera network.',
    },
    {
      id: 'location-neighborhood',
      title: 'Prime Gopal Nagar Connectivity Map',
      category: 'Location',
      src: '/images/vedira-anand/page_6.png',
      alt: 'Location Map Gopal Nagar Dr Padhan Layout Nagpur',
      caption: 'Original brochure Page 6: Centrally located at Plot No. 8, Dr. Padhan Layout, 3rd Bus Stop, Gopal Nagar, Nagpur – near NPTI Building, Ambazari, and Pratap Nagar Road.',
    },
  ] as GalleryItem[],

  brochureDisclaimer:
    'Disclaimer: All visual representations, floor plans, dimensions, specifications, and project illustrations are conceptual and based on the official brochure released by WallStone Realty Pvt. Ltd. for Vedira Anand (Plot No. 8, Dr. Padhan Layout, Gopal Nagar, Nagpur). All specifications and amenities are subject to developer discretion and statutory approvals.',
};
