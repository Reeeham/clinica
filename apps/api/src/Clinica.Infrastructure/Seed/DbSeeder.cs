using Clinica.Domain.Entities;
using Clinica.Domain.Enums;
using Clinica.Infrastructure.Auth;
using Clinica.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Infrastructure.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(ClinicaDbContext db, IPasswordHasher hasher)
    {
        if (await db.Clinics.AnyAsync()) return;

        var clinicId = Guid.Parse("a1b2c3d4-0000-0000-0000-000000000001");
        var passwordHash = hasher.HashPassword("demo1234");

        // Clinic
        var clinic = new Clinic
        {
            Id = clinicId,
            Slug = "nour-aesthetics",
            NameEn = "Nour Aesthetics",
            NameAr = "نور لجمال البشرة",
            TaglineEn = "Advanced skin & laser clinic",
            TaglineAr = "عيادة متقدمة للبشرة والليزر",
            AboutEn = "Nour Aesthetics is a leading cosmetics clinic in New Cairo specializing in laser, skin, and injectable treatments.",
            AboutAr = "نور لجمال البشرة هي عيادة رائدة في التجمع الخامس متخصصة في الليزر والبشرة والحقن.",
            CityEn = "Cairo",
            CityAr = "القاهرة",
            AreaEn = "New Cairo",
            AreaAr = "التجمع الخامس",
            AddressEn = "Street 9, Building 42, New Cairo",
            AddressAr = "شارع ٩، مبنى ٤٢، التجمع الخامس",
            Lat = 30.0250,
            Lng = 31.4980,
            Phone = "0223030404",
            Whatsapp = "201003040506",
            Rating = 4.8f,
            ReviewCount = 312,
            Verified = true,
            Palette = ["#7A2F5F", "#2B5FA8"],
            AmenitiesEn = ["Free parking", "WiFi", "Refreshments", "Private rooms"],
            AmenitiesAr = ["موقف مجاني", "واي فاي", "مرطبات", "غرف خاصة"],
            Specialties = ["laser", "skin", "injectables", "body"],
            Plan = ClinicPlan.Growth,
        };
        db.Clinics.Add(clinic);
        await db.SaveChangesAsync();

        // Rooms
        var rooms = new[]
        {
            new Room { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Room 1 — Laser", NameAr = "غرفة ١ — ليزر", Supports = ["laser", "skin"] },
            new Room { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Room 2 — Laser", NameAr = "غرفة ٢ — ليزر", Supports = ["laser", "body"] },
            new Room { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Room 3 — Injectables", NameAr = "غرفة ٣ — حقن", Supports = ["injectables", "skin"] },
            new Room { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Room 4 — Consultation", NameAr = "غرفة ٤ — استشارة", Supports = ["consultation", "skin", "injectables"] },
        };
        db.Rooms.AddRange(rooms);
        await db.SaveChangesAsync();

        // Employees
        var ownerId = Guid.NewGuid();
        var employees = new[]
        {
            new Employee
            {
                Id = ownerId, ClinicId = clinicId,
                NameEn = "Dr. Nour Hassan", NameAr = "د. نور حسن",
                Role = EmployeeRole.Owner, TitleEn = "Medical Director", TitleAr = "المدير الطبي",
                Phone = "01001234567", Email = "owner@nour-aesthetics.com",
                Status = EmployeeStatus.Active, HiredAt = new DateTime(2024, 1, 1),
                Salary = 0, CommissionRate = 0,
                Specialties = ["laser", "skin", "injectables"],
                Color = "#7A2F5F", Initials = "NH", Rating = 4.9f,
                CanLogin = true, PasswordHash = passwordHash,
            },
            new Employee
            {
                Id = Guid.NewGuid(), ClinicId = clinicId,
                NameEn = "Dr. Sara Mahmoud", NameAr = "د. سارة محمود",
                Role = EmployeeRole.Doctor, TitleEn = "Dermatologist", TitleAr = "طبيبة جلدية",
                Phone = "01002345678", Email = "sara@nour-aesthetics.com",
                Status = EmployeeStatus.Active, HiredAt = new DateTime(2024, 3, 1),
                Salary = 2500000, CommissionRate = 0.15,
                Specialties = ["skin", "injectables"],
                Color = "#2B5FA8", Initials = "SM", Rating = 4.8f,
                CanLogin = true, PasswordHash = passwordHash,
            },
            new Employee
            {
                Id = Guid.NewGuid(), ClinicId = clinicId,
                NameEn = "Menna Allah", NameAr = "منة الله",
                Role = EmployeeRole.Therapist, TitleEn = "Laser Therapist", TitleAr = "أخصائية ليزر",
                Phone = "01003456789", Email = "menna@nour-aesthetics.com",
                Status = EmployeeStatus.Active, HiredAt = new DateTime(2024, 5, 1),
                Salary = 1200000, CommissionRate = 0.10,
                Specialties = ["laser", "body"],
                Color = "#1F7A5C", Initials = "MA", Rating = 4.7f,
                CanLogin = false, PasswordHash = null,
            },
            new Employee
            {
                Id = Guid.NewGuid(), ClinicId = clinicId,
                NameEn = "Reem Khaled", NameAr = "ريم خالد",
                Role = EmployeeRole.Receptionist, TitleEn = "Front Desk", TitleAr = "الاستقبال",
                Phone = "01004567890", Email = "reem@nour-aesthetics.com",
                Status = EmployeeStatus.Active, HiredAt = new DateTime(2024, 6, 1),
                Salary = 800000, CommissionRate = 0,
                Specialties = [],
                Color = "#B5730B", Initials = "RK", Rating = 0,
                CanLogin = true, PasswordHash = passwordHash,
            },
        };
        db.Employees.AddRange(employees);
        await db.SaveChangesAsync();

        // Shifts for employees
        foreach (var emp in employees)
        {
            for (int day = 0; day < 7; day++)
            {
                if (day == 5) continue; // Friday closed
                db.Shifts.Add(new Shift
                {
                    EmployeeId = emp.Id,
                    Day = day,
                    From = "11:00",
                    To = "20:00",
                });
            }
        }
        await db.SaveChangesAsync();

        // Services
        var services = new[]
        {
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Underarm Laser", NameAr = "ليزر تحت الإبط", Category = ServiceCategory.Laser, DescriptionEn = "Diode laser hair removal for underarms.", DescriptionAr = "إزالة شعر تحت الإبط بالليزر الدايود.", DurationMin = 30, Price = 60000, RecommendedSessions = 6, Device = "Diode", RequiresDoctor = false, AftercareEn = "Avoid sun exposure for 48h.", AftercareAr = "تجنب التعرض للشمس لمدة ٤٨ ساعة.", Demand30d = 84 },
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Full Legs Laser", NameAr = "ليزر الساقين بالكامل", Category = ServiceCategory.Laser, DescriptionEn = "Diode laser hair removal for full legs.", DescriptionAr = "إزالة شعر الساقين بالكامل بالليزر.", DurationMin = 60, Price = 150000, RecommendedSessions = 6, Device = "Diode", RequiresDoctor = false, AftercareEn = "Avoid sun exposure for 48h.", AftercareAr = "تجنب التعرض للشمس لمدة ٤٨ ساعة.", Demand30d = 62 },
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Hydrafacial", NameAr = "هايدرا فيشل", Category = ServiceCategory.Skin, DescriptionEn = "Deep cleansing and hydration facial.", DescriptionAr = "تنظيف عميق وترطيب للبشرة.", DurationMin = 45, Price = 120000, RecommendedSessions = 1, Device = null, RequiresDoctor = false, AftercareEn = "Use SPF 50 daily.", AftercareAr = "استخدم واقي شمس ٥٠ يوميًا.", Demand30d = 48 },
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Botox — Glabella", NameAr = "بوتوكس — بين الحاجبين", Category = ServiceCategory.Injectables, DescriptionEn = "Botox injections for glabella lines.", DescriptionAr = "حقن البوتوكس لخطوط بين الحاجبين.", DurationMin = 20, Price = 250000, RecommendedSessions = 1, Device = null, RequiresDoctor = true, AftercareEn = "Do not lie down for 4h.", AftercareAr = "لا تستلقِ لمدة ٤ ساعات.", Demand30d = 22 },
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "CoolSculpting — Abdomen", NameAr = "كول سكالبتنج — البطن", Category = ServiceCategory.Body, DescriptionEn = "Fat freezing for abdomen area.", DescriptionAr = "تجميد الدهون لمنطقة البطن.", DurationMin = 60, Price = 350000, RecommendedSessions = 3, Device = "CoolSculpting", RequiresDoctor = true, AftercareEn = "Massage area gently for 5 min daily.", AftercareAr = "دلك المنطقة بلطف ٥ دقائق يوميًا.", Demand30d = 18 },
            new Service { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Consultation", NameAr = "استشارة", Category = ServiceCategory.Consultation, DescriptionEn = "Initial consultation with dermatologist.", DescriptionAr = "استشارة أولية مع طبيب الجلدية.", DurationMin = 30, Price = 30000, RecommendedSessions = 1, Device = null, RequiresDoctor = true, AftercareEn = "Follow prescribed treatment plan.", AftercareAr = "اتبع خطة العلاج الموصى بها.", Demand30d = 35 },
        };
        db.Services.AddRange(services);
        await db.SaveChangesAsync();

        // Packages
        var laserPkg = new Package
        {
            Id = Guid.NewGuid(), ClinicId = clinicId,
            NameEn = "Full Body Laser Course", NameAr = "كورس ليزر لكامل الجسم",
            DescriptionEn = "6 sessions of full body laser at a discounted rate.", DescriptionAr = "٦ جلسات ليزر لكامل الجسم بسعر مخفض.",
            Price = 800000, ListPrice = 1200000, ValidityDays = 180,
            Published = true, Featured = true, SoldCount = 42,
        };
        laserPkg.Items = new List<PackageItem>
        {
            new() { Package = laserPkg, ServiceId = services[0].Id, Sessions = 6 },
            new() { Package = laserPkg, ServiceId = services[1].Id, Sessions = 6 },
        };
        db.Packages.Add(laserPkg);

        var skinPkg = new Package
        {
            Id = Guid.NewGuid(), ClinicId = clinicId,
            NameEn = "Glow Bundle", NameAr = "باكدج النضارة",
            DescriptionEn = "4 Hydrafacial sessions + 1 consultation.", DescriptionAr = "٤ جلسات هايدرا فيشل + استشارة واحدة.",
            Price = 400000, ListPrice = 510000, ValidityDays = 90,
            Published = true, Featured = false, SoldCount = 28,
        };
        skinPkg.Items = new List<PackageItem>
        {
            new() { Package = skinPkg, ServiceId = services[2].Id, Sessions = 4 },
            new() { Package = skinPkg, ServiceId = services[5].Id, Sessions = 1 },
        };
        db.Packages.Add(skinPkg);
        await db.SaveChangesAsync();

        // Offers
        db.Offers.Add(new Offer
        {
            Id = Guid.NewGuid(), ClinicId = clinicId,
            TitleEn = "Summer Special — 15% off laser", TitleAr = "عرض الصيف — خصم ١٥٪ على الليزر",
            DescriptionEn = "15% off all laser services for new clients.", DescriptionAr = "خصم ١٥٪ على جميع خدمات الليزر للعملاء الجدد.",
            Kind = OfferKind.Percent, Value = 15, Code = "SUMMER15",
            ScopeKind = "services", ScopeIds = [services[0].Id.ToString(), services[1].Id.ToString()],
            StartsAt = new DateTime(2026, 6, 1), EndsAt = new DateTime(2026, 9, 30),
            UsageLimit = 100, UsedCount = 23, Published = true,
        });
        await db.SaveChangesAsync();

        // Sample customers
        var customers = new[]
        {
            new Customer { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Farida Hassan", NameAr = "فريدة حسن", Phone = "01005678901", Email = "farida.hassan@gmail.com", Gender = "female", BirthDate = new DateTime(1995, 3, 15), SkinType = "III", Allergies = [], Conditions = [], Notes = "Prefers appointments after 6 PM.", Tags = ["VIP", "Laser course"], Source = CustomerSource.App, MarketingOptIn = true, Color = "#7A2F5F", Initials = "FH", CreatedAt = DateTime.UtcNow.AddDays(-120) },
            new Customer { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Sara Mahmoud", NameAr = "سارة محمود", Phone = "01006789012", Email = "sara.m@gmail.com", Gender = "female", BirthDate = new DateTime(1990, 7, 22), SkinType = "IV", Allergies = ["Lidocaine"], Conditions = [], Notes = null, Tags = ["Laser course"], Source = CustomerSource.WalkIn, MarketingOptIn = true, Color = "#2B5FA8", Initials = "SM", CreatedAt = DateTime.UtcNow.AddDays(-90) },
            new Customer { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Nadine Adel", NameAr = "نادين عادل", Phone = "01007890123", Email = null, Gender = "female", BirthDate = new DateTime(1998, 11, 3), SkinType = "II", Allergies = [], Conditions = ["Active acne"], Notes = "Sensitive to cold — skip the chiller on legs.", Tags = ["Sensitive skin"], Source = CustomerSource.Instagram, MarketingOptIn = false, Color = "#1F7A5C", Initials = "NA", CreatedAt = DateTime.UtcNow.AddDays(-45) },
            new Customer { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Karim Tarek", NameAr = "كريم طارق", Phone = "01008901234", Email = "karim.tarek@gmail.com", Gender = "male", BirthDate = new DateTime(1992, 5, 18), SkinType = "IV", Allergies = [], Conditions = [], Notes = null, Tags = [], Source = CustomerSource.Referral, MarketingOptIn = true, Color = "#B5730B", Initials = "KT", CreatedAt = DateTime.UtcNow.AddDays(-200) },
            new Customer { Id = Guid.NewGuid(), ClinicId = clinicId, NameEn = "Menna Allah", NameAr = "منة الله", Phone = "01009012345", Email = "menna.a@gmail.com", Gender = "female", BirthDate = new DateTime(2000, 1, 10), SkinType = "III", Allergies = [], Conditions = [], Notes = null, Tags = ["Bride"], Source = CustomerSource.App, MarketingOptIn = true, Color = "#9B3D77", Initials = "MA", CreatedAt = DateTime.UtcNow.AddDays(-15) },
        };
        db.Customers.AddRange(customers);
        await db.SaveChangesAsync();

        // Sample bookings
        var today = DateTime.Today;
        for (int i = 0; i < 5; i++)
        {
            var bookingDate = today.AddDays(i);
            if (bookingDate.DayOfWeek == DayOfWeek.Friday) continue;

            db.Bookings.Add(new Booking
            {
                Id = Guid.NewGuid(),
                Ref = $"NA-{1042 + i}",
                ClinicId = clinicId,
                CustomerId = customers[i % customers.Length].Id,
                EmployeeId = employees[i % employees.Length].Id,
                RoomId = rooms[i % rooms.Length].Id,
                ServiceId = services[i % services.Length].Id,
                StartsAt = bookingDate.AddHours(14).AddMinutes(30),
                EndsAt = bookingDate.AddHours(15),
                Status = i == 0 ? BookingStatus.Confirmed : BookingStatus.Pending,
                Channel = i % 2 == 0 ? BookingChannel.App : BookingChannel.WalkIn,
                Price = services[i % services.Length].Price,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
            });
        }
        await db.SaveChangesAsync();

        // Opening hours
        for (int day = 0; day < 7; day++)
        {
            if (day == 5) continue;
            db.OpeningHours.Add(new OpeningHours
            {
                ClinicId = clinicId,
                Day = day,
                Open = "11:00",
                Close = "20:00",
            });
        }
        await db.SaveChangesAsync();

        // Reviews
        var reviews = new[]
        {
            new Review { Id = Guid.NewGuid(), ClinicId = clinicId, CustomerId = customers[0].Id, ServiceId = services[0].Id, Rating = 5, BodyEn = "Amazing results after just 3 sessions! The staff is professional and the clinic is spotless.", BodyAr = "نتائج مذهلة بعد ٣ جلسات فقط! الفريق محترف والعيادة نظيفة جدًا.", ReplyEn = "Thank you Farida! We're thrilled with your progress.", ReplyAr = "شكرًا فريدة! نحن سعداء بتقدمك.", CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new Review { Id = Guid.NewGuid(), ClinicId = clinicId, CustomerId = customers[1].Id, ServiceId = services[2].Id, Rating = 5, BodyEn = "Best hydrafacial in Cairo. My skin has never looked better.", BodyAr = "أفضل هايدرا فيشل في القاهرة. بشرتي لم تبدو أفضل من ذلك.", ReplyEn = "Thank you Sara! See you at your next session.", ReplyAr = "شكرًا سارة! نراك في الجلسة القادمة.", CreatedAt = DateTime.UtcNow.AddDays(-15) },
            new Review { Id = Guid.NewGuid(), ClinicId = clinicId, CustomerId = customers[3].Id, ServiceId = services[3].Id, Rating = 4, BodyEn = "Very happy with the botox results. Dr. Sara is highly skilled.", BodyAr = "سعيد جدًا بنتائج البوتوكس. د. سارة ماهرة جدًا.", ReplyEn = null, ReplyAr = null, CreatedAt = DateTime.UtcNow.AddDays(-7) },
        };
        db.Reviews.AddRange(reviews);
        await db.SaveChangesAsync();

        // Second clinic — for discovery
        var clinic2Id = Guid.Parse("a1b2c3d4-0000-0000-0000-000000000002");
        var clinic2 = new Clinic
        {
            Id = clinic2Id,
            Slug = "glow-skin-clinic",
            NameEn = "Glow Skin Clinic",
            NameAr = "عيادة جلو للبشرة",
            TaglineEn = "Your skin, our passion",
            TaglineAr = "بشرتك، شغفنا",
            AboutEn = "Glow Skin Clinic is a boutique aesthetics clinic in Zamalek offering personalized skin treatments, facials, and anti-aging solutions.",
            AboutAr = "عيادة جلو للبشرة هي عيادة تجميل في الزمالك تقدم علاجات شخصية للبشرة والوجه ومضادات الشيخوخة.",
            CityEn = "Cairo",
            CityAr = "القاهرة",
            AreaEn = "Zamalek",
            AreaAr = "الزمالك",
            AddressEn = "26th of July St, Zamalek, Cairo",
            AddressAr = "شارع ٢٦ يوليو، الزمالك، القاهرة",
            Lat = 30.0626,
            Lng = 31.2197,
            Phone = "0227350606",
            Whatsapp = "201006070809",
            Rating = 4.6f,
            ReviewCount = 187,
            Verified = true,
            Palette = ["#1F7A5C", "#D4A574"],
            AmenitiesEn = ["WiFi", "Refreshments", "Private rooms"],
            AmenitiesAr = ["واي فاي", "مرطبات", "غرف خاصة"],
            Specialties = ["skin", "injectables", "facials"],
            Plan = ClinicPlan.Starter,
        };
        db.Clinics.Add(clinic2);
        await db.SaveChangesAsync();

        // Clinic 2 rooms
        var room2 = new Room { Id = Guid.NewGuid(), ClinicId = clinic2Id, NameEn = "Treatment Room 1", NameAr = "غرفة علاج ١", Supports = ["skin", "injectables", "consultation"] };
        db.Rooms.Add(room2);
        await db.SaveChangesAsync();

        // Clinic 2 employees
        var emp2Id = Guid.NewGuid();
        db.Employees.Add(new Employee
        {
            Id = emp2Id, ClinicId = clinic2Id,
            NameEn = "Dr. Laila Farouk", NameAr = "د. ليلى فاروق",
            Role = EmployeeRole.Owner, TitleEn = "Dermatologist", TitleAr = "طبيبة جلدية",
            Phone = "01005556677", Email = "laila@glowskin.com",
            Status = EmployeeStatus.Active, HiredAt = new DateTime(2024, 2, 1),
            Salary = 0, CommissionRate = 0,
            Specialties = ["skin", "injectables"],
            Color = "#1F7A5C", Initials = "LF", Rating = 4.7f,
            CanLogin = true, PasswordHash = passwordHash,
        });
        await db.SaveChangesAsync();

        // Clinic 2 services
        var svc2_1 = new Service { Id = Guid.NewGuid(), ClinicId = clinic2Id, NameEn = "Chemical Peel", NameAr = "تقشير كيميائي", Category = ServiceCategory.Skin, DescriptionEn = "Medium-depth chemical peel for skin renewal.", DescriptionAr = "تقشير كيميائي متوسط العمق لتجديد البشرة.", DurationMin = 45, Price = 90000, RecommendedSessions = 3, Device = null, RequiresDoctor = true, AftercareEn = "Avoid sun and use SPF 50.", AftercareAr = "تجنب الشمس واستخدم واقي ٥٠.", Demand30d = 30, Published = true };
        var svc2_2 = new Service { Id = Guid.NewGuid(), ClinicId = clinic2Id, NameEn = "Dermal Fillers — Lips", NameAr = "فيلر — الشفاه", Category = ServiceCategory.Injectables, DescriptionEn = "Hyaluronic acid lip fillers for natural volume.", DescriptionAr = "فيلر حمض الهيالورونيك للشفاه لمظهر طبيعي.", DurationMin = 30, Price = 300000, RecommendedSessions = 1, Device = null, RequiresDoctor = true, AftercareEn = "Avoid pressure on lips for 24h.", AftercareAr = "تجنب الضغط على الشفاه لمدة ٢٤ ساعة.", Demand30d = 15, Published = true };
        var svc2_3 = new Service { Id = Guid.NewGuid(), ClinicId = clinic2Id, NameEn = "Microneedling", NameAr = "الإبر الدقيقة", Category = ServiceCategory.Skin, DescriptionEn = "Collagen induction therapy for acne scars and fine lines.", DescriptionAr = "علاج تحفيز الكولاجين لحب الشباب والخطوط الدقيقة.", DurationMin = 60, Price = 100000, RecommendedSessions = 4, Device = "Dermapen", RequiresDoctor = false, AftercareEn = "Keep skin hydrated and avoid makeup for 24h.", AftercareAr = "حافظ على ترطيب البشرة وتجنب المكياج لمدة ٢٤ ساعة.", Demand30d = 25, Published = true };
        db.Services.AddRange(svc2_1, svc2_2, svc2_3);
        await db.SaveChangesAsync();

        // Clinic 2 opening hours
        for (int day = 0; day < 7; day++)
        {
            if (day == 5) continue; // Friday closed
            db.OpeningHours.Add(new OpeningHours { ClinicId = clinic2Id, Day = day, Open = "12:00", Close = "21:00" });
        }
        await db.SaveChangesAsync();

        Console.WriteLine("Seed data inserted successfully.");
    }
}
