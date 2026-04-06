import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding admin user...")

  const passwordHash = await bcrypt.hash("admin123", 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@changeloger.dev" },
    update: {},
    create: {
      email: "admin@changeloger.dev",
      passwordHash,
      name: "Platform Admin",
      role: "superadmin",
    },
  })

  console.log(`  Admin: ${admin.email} (${admin.role})`)
  console.log("  Password: admin123")
  console.log("\nAdmin seed complete!")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Admin seed error:", e)
    prisma.$disconnect()
    process.exit(1)
  })
