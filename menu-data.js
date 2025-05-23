// Menu data structure
const menuData = {
    categories: [
        {
            id: "features",
            name: "مميزات فانيلو",
            nameEn: "Vanillo Features",
            description: "مميزات فانيلو المتنوعة",
            image: "images/features.jpg"
        },
        {
            id: "crepes",
            name: "كريبات فانيلو",
            nameEn: "Vanillo Crepes",
            description: "كريبات فانيلو المتنوعة",
            image: "images/crepes.jpg"
        },
        {
            id: "waffles",
            name: "وافل فانيلو",
            nameEn: "Vanillo Waffles",
            description: "وافل فانيلو المتنوع",
            image: "images/waffles.jpg"
        },
        {
            id: "fish",
            name: "فشافيش فانيلو",
            nameEn: "Vanillo Fish",
            description: "فشافيش فانيلو المتنوعة",
            image: "images/fish.jpg"
        },
        {
            id: "pancakes",
            name: "بانكيك فانيلو",
            nameEn: "Vanillo Pancakes",
            description: "بانكيك فانيلو المتنوع",
            image: "images/pancakes.jpg"
        },
        {
            id: "drinks",
            name: "مشروبات فانيلو",
            nameEn: "Vanillo Drinks",
            description: "مشروبات فانيلو المتنوعة",
            image: "images/drinks.jpg"
        }
    ],
    items: [
        {
            id: "mickey",
            categoryId: "features",
            name: "ميكي فانيلو",
            nameEn: "Vanillo Mickey",
            price: 25.00,
            currency: "ILS",
            description: "",
            image: "images/mickey.jpg"
        },
        {
            id: "fish",
            categoryId: "features",
            name: "سمكة فانيلو",
            nameEn: "Vanillo Fish",
            price: 20.00,
            currency: "ILS",
            description: "",
            image: "images/fish.jpg"
        },
        {
            id: "baby-fish",
            categoryId: "features",
            name: "بيبي فيش فانيلو",
            nameEn: "Vanillo Baby Fish",
            price: 20.00,
            currency: "ILS",
            description: "10 سمكات صغار وعلى جانبها الشوكلاطة",
            image: "images/baby-fish.jpg"
        },
        {
            id: "souffle",
            categoryId: "features",
            name: "سوفلية",
            nameEn: "Souffle",
            price: 25.00,
            currency: "ILS",
            description: "سوفلية محشية الشوكلاطة الساخنة",
            image: "images/souffle.jpg"
        },
        {
            id: "churros-filled",
            categoryId: "features",
            name: "تشوروس محشي",
            nameEn: "Filled Churros",
            price: 25.00,
            currency: "ILS",
            description: "",
            image: "images/churros-filled.jpg"
        },
        {
            id: "churros",
            categoryId: "features",
            name: "تشوروس عادي",
            nameEn: "Regular Churros",
            price: 20.00,
            currency: "ILS",
            description: "",
            image: "images/churros.jpg"
        },
        {
            id: "yogurt",
            categoryId: "features",
            name: "يوغورت",
            nameEn: "Yogurt",
            price: 20.00,
            currency: "ILS",
            description: "",
            image: "images/yogurt.jpg"
        },
        {
            id: "crepe-triangle",
            categoryId: "crepes",
            name: "كريب مثلث\\مقطع",
            nameEn: "Triangle/Cut Crepe",
            price: 20.00,
            currency: "ILS",
            description: "كريب مثلث او مقطع بدون اضافات",
            image: "images/crepe-triangle.jpg"
        },
        {
            id: "crepe-snail",
            categoryId: "crepes",
            name: "كريب الحلزونة",
            nameEn: "Snail Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بوظة",
            image: "images/crepe-snail.jpg"
        },
        {
            id: "crepe-cake",
            categoryId: "crepes",
            name: "كريب الكعكة",
            nameEn: "Cake Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بلكريمة والشوكلاطات او الفواكه الطازجة",
            image: "images/crepe-cake.jpg"
        },
        {
            id: "crepe-sushi",
            categoryId: "crepes",
            name: "كريب سوشي",
            nameEn: "Sushi Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بكعكة الكيندر",
            image: "images/crepe-sushi.jpg"
        },
        {
            id: "crepe-fettuccine",
            categoryId: "crepes",
            name: "كريب فوتشيني",
            nameEn: "Fettuccine Crepe",
            price: 25.00,
            currency: "ILS",
            description: "كريب فوتوشيني مميز",
            image: "images/crepe-fettuccine.jpg"
        },
        {
            id: "crepe-lotus",
            categoryId: "crepes",
            name: "كريب لوتوس",
            nameEn: "Lotus Crepe",
            price: 30.00,
            currency: "ILS",
            description: "",
            image: "images/crepe-lotus.jpg"
        },
        {
            id: "crepe-fruits",
            categoryId: "crepes",
            name: "كريب محشي فواكه",
            nameEn: "Fruit Filled Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بلفواكه الطازجة",
            image: "images/crepe-fruits.jpg"
        },
        {
            id: "crepe-nutella-mix",
            categoryId: "crepes",
            name: "كريب نوتيلا ميكس",
            nameEn: "Nutella Mix Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب مثلث مع اضافة 3 انواع شوكلاطة بجانب الكريب",
            image: "images/crepe-nutella-mix.jpg"
        },
        {
            id: "crepe-kitkat",
            categoryId: "crepes",
            name: "كريب كات كات",
            nameEn: "KitKat Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بشوكلاطة الكات كات",
            image: "images/crepe-kitkat.jpg"
        },
        {
            id: "crepe-vip",
            categoryId: "crepes",
            name: "كريب VIP",
            nameEn: "VIP Crepe",
            price: 30.00,
            currency: "ILS",
            description: "كريب محشي بلشوكلاطة",
            image: "images/crepe-vip.jpg"
        },
        {
            id: "waffle-finger",
            categoryId: "waffles",
            name: "وافل اصباع",
            nameEn: "Finger Waffle",
            price: 10.00,
            currency: "ILS",
            description: "",
            image: "images/waffle-finger.jpg"
        },
        {
            id: "waffle-bubble",
            categoryId: "waffles",
            name: "وافل بابلي",
            nameEn: "Bubble Waffle",
            price: 25.00,
            currency: "ILS",
            description: "",
            image: "images/waffle-bubble.jpg"
        },
        {
            id: "waffle-family",
            categoryId: "waffles",
            name: "وافل عائلي",
            nameEn: "Family Waffle",
            price: 20.00,
            currency: "ILS",
            description: "",
            image: "images/waffle-family.jpg"
        },
        {
            id: "waffle-fruits",
            categoryId: "waffles",
            name: "وافل فواكه",
            nameEn: "Fruit Waffle",
            price: 30.00,
            currency: "ILS",
            description: "",
            image: "images/waffle-fruits.jpg"
        },
        {
            id: "fachafish-12",
            categoryId: "fish",
            name: "12 حبة فشافيش",
            nameEn: "12 Fish Pieces",
            price: 20.00,
            currency: "ILS",
            description: "",
            image: "images/fachafish-12.jpg"
        },
        {
            id: "fachafish-24",
            categoryId: "fish",
            name: "24 حبة فشافيش",
            nameEn: "24 Fish Pieces",
            price: 35.00,
            currency: "ILS",
            description: "",
            image: "images/fachafish-24.jpg"
        },
        {
            id: "fachafish-6",
            categoryId: "fish",
            name: "6 حبة فشافيش",
            nameEn: "6 Fish Pieces",
            price: 10.00,
            currency: "ILS",
            description: "",
            image: "images/fachafish-6.jpg"
        },
        {
            id: "pancake-3",
            categoryId: "pancakes",
            name: "3 قطع بانكيك",
            nameEn: "3 Pancake Pieces",
            price: 30.00,
            currency: "ILS",
            description: "",
            image: "images/pancake-3.jpg"
        },
        {
            id: "pancake-lotus",
            categoryId: "pancakes",
            name: "بانكيك لوتوس",
            nameEn: "Lotus Pancake",
            price: 35.00,
            currency: "ILS",
            description: "بانكيك لوتوس المكونة من ثلاثة قطع",
            image: "images/pancake-lotus.jpg"
        },
        {
            id: "pancake-12",
            categoryId: "pancakes",
            name: "12 قطعة بانكيك",
            nameEn: "12 Pancake Pieces",
            price: 20.00,
            currency: "ILS",
            description: "حجم صغير",
            image: "images/pancake-12.jpg"
        },
        {
            id: "cocktail",
            categoryId: "drinks",
            name: "كوكتيل فانيلو",
            nameEn: "Vanillo Cocktail",
            price: 17.00,
            currency: "ILS",
            description: "",
            image: "images/vanillo-cocktail.jpg"
        },
        {
            id: "milkshake",
            categoryId: "drinks",
            name: "ميلكشيك فانيلو",
            nameEn: "Vanillo Milkshake",
            price: 17.00,
            currency: "ILS",
            description: "ميلكشيك من جميع انواع البوظة",
            image: "images/vanillo-milkshake.jpg"
        },
        {
            id: "mojito",
            categoryId: "drinks",
            name: "موخيتو",
            nameEn: "Mojito",
            price: 12.00,
            currency: "ILS",
            description: "امكانية استعمال سبرايت او مشروب طاقة",
            image: "images/mojito.jpg"
        },
        {
            id: "juice",
            categoryId: "drinks",
            name: "جروس",
            nameEn: "Juice",
            price: 5.00,
            currency: "ILS",
            description: "",
            image: "images/juice.jpg"
        },
        {
            id: "iced-coffee",
            categoryId: "drinks",
            name: "ايسكافية",
            nameEn: "Iced Coffee",
            price: 5.00,
            currency: "ILS",
            description: "",
            image: "images/iced-coffee.jpg"
        },
        {
            id: "orange-juice",
            categoryId: "drinks",
            name: "عصير برتقال",
            nameEn: "Orange Juice",
            price: 10.00,
            currency: "ILS",
            description: "",
            image: "images/orange-juice.jpg"
        },
        {
            id: "cold-drink",
            categoryId: "drinks",
            name: "مشروب بارد",
            nameEn: "Cold Drink",
            price: 7.00,
            currency: "ILS",
            description: "",
            image: "images/cold-drink.jpg"
        },
        {
            id: "water",
            categoryId: "drinks",
            name: "ماء",
            nameEn: "Water",
            price: 7.00,
            currency: "ILS",
            description: "",
            image: "images/water.jpg"
        }
    ]
};

// Restaurant info
const restaurantInfo = {
    name: "فانيلو",
    nameEn: "Vanillo",
    description: "مطعم فانيلو للوجبات السريعة والمشروبات",
    address: "شارع الرئيسي، المدينة",
    phone: "123-456-7890",
    email: "info@vanillo.com",
    logo: "images/logo.png",
    openingHours: {
        monday: "9:00 - 22:00",
        tuesday: "9:00 - 22:00",
        wednesday: "9:00 - 22:00",
        thursday: "9:00 - 22:00",
        friday: "9:00 - 23:00",
        saturday: "9:00 - 23:00",
        sunday: "9:00 - 22:00"
    }
};

module.exports = { menuData, restaurantInfo }; 