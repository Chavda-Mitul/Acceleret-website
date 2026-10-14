/**
 * Imports the seven case studies from the old site (innodify.in/case-studies),
 * rewritten for this site, with their cover photos (free Unsplash images, as
 * the old site used).
 *
 *   npm run seed:work                  creates them as drafts (not public)
 *   SEED_PUBLISH=1 npm run seed:work   creates them published (for local testing)
 *
 * Safe to run twice: a case study whose slug already exists is skipped.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import type { CaseStudy } from "../payload-types";

const publish = process.env.SEED_PUBLISH === "1";

type Seed = Pick<
  CaseStudy,
  "slug" | "title" | "client" | "result" | "summary" | "situation" | "whatWeBuilt" | "tags" | "techStack"
> & {
  features: string[];
  outcomes: { value?: string; label: string }[];
  quote?: { text: string; role: string };
  /** Unsplash photo id and what it shows. */
  cover: { id: string; alt: string };
};

const studies: Seed[] = [
  {
    slug: "salt-and-glitz-app",
    client: "Salt & Glitz",
    title: "A jewellery mobile app",
    result: "One Flutter app, live on both stores, that feels as premium as the brand.",
    tags: ["Jewellery", "Mobile app"],
    techStack: ["Flutter", "Dart", "Firebase", "REST API"],
    summary: {
      problem: "A lab-grown diamond brand with no app for its customers.",
      built: "One Flutter app for iOS and Android, designed around the brand.",
      changed: "Live on the App Store and Play Store, alongside the new website.",
    },
    situation:
      "Salt & Glitz sells CVD lab-grown diamond jewellery: ethical, conflict-free pieces sold as modern luxury. They wanted customers to be able to browse the collection on their phones, on iPhone and Android alike, with an app that felt as considered as the jewellery itself.",
    whatWeBuilt:
      "A cross-platform Flutter app from a single codebase, with a custom design and smooth animations, so it feels native on both iOS and Android. We took it through Apple's App Store review and launched it on Google Play, as part of one brand experience with their new website.",
    features: [
      "One Flutter codebase for iOS and Android",
      "Custom design and animations built around the brand",
      "Published through App Store review and on Google Play",
    ],
    outcomes: [
      { value: "2", label: "App stores: Apple and Google" },
      { value: "1", label: "Codebase to maintain" },
      { label: "One brand experience across app and website" },
    ],
    quote: {
      text: "The Flutter app Innodify built for us is exactly what we envisioned. It looks and feels premium on both iOS and Android, perfectly reflecting our CVD diamond brand. The app store launch was seamless.",
      role: "Founder",
    },
    cover: { id: "1605100804763-247f67b3557e", alt: "A diamond ring with a rose-gold halo on a black box" },
  },
  {
    slug: "salt-and-glitz-website",
    client: "Salt & Glitz",
    title: "A custom online store for lab-grown diamonds",
    result: "A fast, fully custom store that shows high-value pieces properly and takes payment securely.",
    tags: ["Jewellery", "eCommerce", "Website"],
    techStack: ["Next.js", "React", "Node.js", "MongoDB", "Tailwind CSS"],
    summary: {
      problem: "Templates couldn't show premium jewellery the way the brand wanted.",
      built: "A custom eCommerce site with detailed galleries and secure checkout.",
      changed: "The collection sells online, on a site that loads fast and is built for search.",
    },
    situation:
      "Salt & Glitz needed to sell their lab-grown diamond collection online. Off-the-shelf templates made every piece look like every other shop's, and high-value purchases needed a checkout customers would trust.",
    whatWeBuilt:
      "A fully custom eCommerce website, designed and built from scratch rather than on a template or a standard platform. Each piece has high-resolution photos with zoom, several views and full specifications. Cart and checkout are built for expensive purchases, with secure payment gateways, and the whole site is built to load quickly and be found in search.",
    features: [
      "Bespoke design, no template",
      "Product galleries with zoom, several views and specifications",
      "Cart and secure checkout for high-value orders",
      "Fast pages, built for search",
    ],
    outcomes: [
      { value: "100%", label: "Custom built" },
      { label: "Browsing, cart and checkout in one smooth flow" },
      { label: "Fast, search-friendly pages that bring customers in" },
    ],
    quote: {
      text: "Our custom website from Innodify perfectly represents our brand. The product galleries look stunning and our customers love the shopping experience. It's exactly what we needed to sell our CVD diamonds online.",
      role: "Founder",
    },
    cover: { id: "1599643478518-a784e5dc4c8f", alt: "Two layered gold necklaces with a blue stone and a crescent pendant" },
  },
  {
    slug: "dkhushalbhai-jewellers",
    client: "D Khushalbhai Jewellers",
    title: "A traditional jeweller's whole collection, online",
    result: "1000+ products online, with three ways to pay and insured delivery across India.",
    tags: ["Jewellery", "eCommerce", "Shopify"],
    techStack: ["Shopify", "Razorpay", "PayU", "Shiprocket", "Delhivery"],
    summary: {
      problem: "Decades of in-store trust, and no way to sell beyond the shop.",
      built: "A Shopify store with payment gateways and insured delivery partners.",
      changed: "The full gold, diamond and silver range sells across India.",
    },
    situation:
      "D Khushalbhai Jewellers is a trusted name in gold, diamond and silver jewellery, built over decades of traditional retail. They wanted to reach customers beyond the shop without losing the premium feel their customers expect, and selling valuable pieces online meant payments and shipping had to be dependable.",
    whatWeBuilt:
      "A Shopify store with a custom-designed storefront: elegant galleries, zoom and detailed product pages for every piece. Customers can pay through Razorpay, PayU or bank transfer, which gives flexibility on high-value orders. Orders go to delivery partners including Shiprocket and Delhivery for insured shipping with live tracking.",
    features: [
      "Custom Shopify storefront with zoom and detailed product pages",
      "Razorpay, PayU and bank transfer",
      "Insured shipping with live tracking",
      "The full gold, diamond and silver collection listed",
    ],
    outcomes: [
      { value: "1000+", label: "Products listed" },
      { value: "3", label: "Ways to pay" },
      { value: "5+", label: "Delivery partners, shipping across India" },
    ],
    quote: {
      text: "Innodify transformed our traditional jewellery business into a modern online store. The website beautifully showcases our gold, diamond, and silver collections. The payment and delivery integrations work flawlessly.",
      role: "Owner",
    },
    cover: { id: "1515562141207-7a88fb7ce338", alt: "A pearl necklace in an open red jewellery box" },
  },
  {
    slug: "mahalaxmi-real-estate",
    client: "Mahalaxmi Real Estate Group",
    title: "A CRM that keeps client numbers inside the company",
    result: "30% more productive agents, and no client data leaving with them.",
    tags: ["Real estate", "CRM"],
    techStack: ["Node.js", "Preact", "Real-time database", "Cloud hosting"],
    summary: {
      problem: "Agents could see and share every client's contact details.",
      built: "A cloud CRM with masked contacts and a drag-and-drop lead pipeline.",
      changed: "Client data stays protected, and agents work faster from any device.",
    },
    situation:
      "Mahalaxmi Real Estate Group sells residential and commercial property in Delhi NCR, with a team of sales agents handling many leads a day. Nothing stopped client phone numbers from being copied and shared. Lead lists were cluttered, and the team could only work from office machines.",
    whatWeBuilt:
      "A web-based CRM shaped around how their agents sell. Admins and agents see different views, and contact details are masked automatically so they can't be passed on. Leads move across a drag-and-drop board from New to Contacted, Site Visit and Won. It runs in the browser on phones, tablets and laptops, so the team can work from anywhere.",
    features: [
      "Separate admin and agent views",
      "Client contact details masked automatically",
      "Drag-and-drop lead board: New, Contacted, Site Visit, Won",
      "Works on phone, tablet or laptop, from anywhere",
    ],
    outcomes: [
      { value: "30%", label: "More productive agents" },
      { value: "0", label: "Cases of client data leaking" },
      { label: "Management sees the pipeline live, from anywhere" },
    ],
    quote: {
      text: "The new web CRM has been a game-changer for Mahalaxmi Real Estate. It's incredibly fast and gives us total control. I finally have peace of mind knowing my client data is secure, and my team can access exactly what they need.",
      role: "Director",
    },
    cover: { id: "1560518883-ce09059eeffa", alt: "A small model house and a set of keys on a wooden table" },
  },
  {
    slug: "ustart",
    client: "Ustart",
    title: "A zero-commission cab and bike app that keeps up",
    result: "A ride-hailing app with native-speed maps and live location, for a 0% commission model.",
    tags: ["Mobility", "Mobile app"],
    techStack: ["React Native", "Expo", "Native modules", "WebSockets", "Maps API"],
    summary: {
      problem: "Live maps and ride matching were too heavy for a typical hybrid app.",
      built: "A React Native app with native modules for maps and background location.",
      changed: "Fast maps and instant ride status for riders and drivers.",
    },
    situation:
      "Ustart runs ride-hailing for cabs, bikes and other transport on a zero-commission model. The app has to handle live location, smooth maps and instant ride matching without draining the battery. That is where typical hybrid apps slow down.",
    whatWeBuilt:
      "A React Native app on Expo that moves the heavy work, such as map interactions and background location tracking, into native modules. A lean global state keeps driver matching and ride status instant. A custom interface lets drivers and riders decide in a second. Expo lets the team ship updates over the air.",
    features: [
      "Native modules for maps and background location",
      "Live connections for ride matching and status",
      "Interface built for quick decisions by drivers and riders",
      "Over-the-air updates through Expo",
    ],
    outcomes: [
      { value: "0%", label: "Commission for drivers" },
      { label: "Maps that stay smooth during live rides" },
      { label: "Reliable location tracking in the background" },
    ],
    cover: { id: "1449965408869-eaa3f722e40d", alt: "A driver's hand on the steering wheel at dusk" },
  },
  {
    slug: "unisphere-exam-portal",
    client: "BML Munjal University",
    title: "Online exams that hold up when everyone starts at once",
    result: "An exam portal that scales with each exam's rush and keeps students locked in.",
    tags: ["Education", "Platform"],
    techStack: ["Node.js", "Kubernetes (AWS EKS)", "SafeExamBrowser", "Redis", "AWS"],
    summary: {
      problem: "Thousands of students start at the same minute, and it must be cheat-proof.",
      built: "Node.js microservices on AWS EKS, with a hardened SafeExamBrowser.",
      changed: "Exams run on time under full load, with no way out of the locked screen.",
    },
    situation:
      "BML Munjal University was moving internal assessments online. When an exam opens, hundreds or thousands of students start in the same minute, and no answer can be lost. Students also must not be able to leave the exam screen or work around it.",
    whatWeBuilt:
      "A microservices backend on Kubernetes (AWS EKS) that adds capacity automatically as traffic peaks. Exam processing, timers and auto-submission run as separate Node.js services, so one busy part can't slow the rest. Students sit exams in a custom build of the open-source SafeExamBrowser that we forked and hardened, so the lock-down can't be bypassed.",
    features: [
      "Scales automatically on AWS EKS during exam windows",
      "Separate services for exams, timers and auto-submission",
      "Custom SafeExamBrowser build that locks the device down",
    ],
    outcomes: [
      { value: "100%", label: "Uptime under exam load" },
      { label: "Capacity grows on its own as each exam opens" },
      { label: "No way out of the locked exam screen" },
    ],
    cover: { id: "1516321318423-f06f85e504b3", alt: "Two people pointing at a laptop screen" },
  },
  {
    slug: "unisphere-app",
    client: "BML Munjal University",
    title: "The whole campus in one app",
    result: "Gatepasses, shuttles, meals and complaints in one app used by 5,000+ people a day.",
    tags: ["Education", "Mobile app"],
    techStack: ["React Native", "Node.js", "PostgreSQL", "Redis", "Socket.io", "AWS"],
    summary: {
      problem: "Campus services were spread across portals, paperwork and systems.",
      built: "One React Native app for passes, shuttles, meals and complaints.",
      changed: "6 processes in one app, used by 5,000+ people every day.",
    },
    situation:
      "Running a university campus means gatepasses, visitor approvals, shuttle bookings, facility complaints, mess menus and student communities. At BML Munjal University these were spread across different portals, paperwork and systems. They wanted one dependable app for all 5,000+ students and staff.",
    whatWeBuilt:
      "A modular React Native app, each feature its own module, backed by Node.js, PostgreSQL and Redis. Gatepasses and visitor approvals use QR codes. Shuttles have live tracking and seat booking. The mess has daily menus, meal booking and how busy the cafeteria is right now, and there are live complaint tickets and community forums. Live connections handle 500–1,000 students booking at once when slots open on the hour.",
    features: [
      "QR-code gatepasses and visitor approvals",
      "Live shuttle tracking and seat booking",
      "Mess menus, meal booking and cafeteria crowd status",
      "Complaint tickets and community forums",
    ],
    outcomes: [
      { value: "5k+", label: "People using it daily" },
      { value: "1k", label: "Students at once at peak times" },
      { value: "6", label: "Campus processes in one app" },
    ],
    cover: { id: "1541339907198-e08756dedf3f", alt: "Graduates throwing their caps into the air" },
  },
];

/* ---------------------------------------------------------------- seed */

const payload = await getPayload({ config });
const context = { disableRevalidate: true };

async function coverFor(slug: string, cover: Seed["cover"]) {
  const res = await fetch(`https://images.unsplash.com/photo-${cover.id}?w=1600&q=80&fm=jpg`);
  if (!res.ok) throw new Error(`Cover for ${slug}: HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  return payload.create({
    collection: "media",
    context,
    data: { alt: cover.alt },
    file: { data, mimetype: "image/jpeg", name: `${slug}.jpg`, size: data.length },
  });
}

let created = 0;
for (const [i, s] of studies.entries()) {
  const existing = await payload.find({
    collection: "case-studies",
    where: { slug: { equals: s.slug } },
    limit: 1,
    draft: true,
  });
  if (existing.docs.length) {
    payload.logger.info(`Skipped ${s.slug}: already exists.`);
    continue;
  }
  const cover = await coverFor(s.slug, s.cover);
  await payload.create({
    collection: "case-studies",
    context,
    draft: !publish,
    data: {
      title: s.title,
      slug: s.slug,
      client: s.client,
      result: s.result,
      coverImage: cover.id,
      summary: s.summary,
      situation: s.situation,
      whatWeBuilt: s.whatWeBuilt,
      features: s.features.map((text) => ({ text })),
      outcomes: s.outcomes,
      quote: s.quote,
      order: (i + 1) * 10,
      tags: s.tags,
      techStack: s.techStack,
      _status: publish ? "published" : "draft",
    },
  });
  created++;
  payload.logger.info(`Created ${s.slug} as ${publish ? "published" : "a draft"}.`);
}

payload.logger.info(`${created} case studies created, ${studies.length - created} skipped.`);
process.exit(0);
