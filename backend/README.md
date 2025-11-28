# 🗞️ مدونة إخبارية - Backend API

Backend API كامل لمدونة إخبارية مبني بـ **MERN Stack** مع نظام إدارة للأدمن والكتّاب والناشرين.

## 🚀 المميزات

- ✅ نظام مصادقة كامل مع JWT
- ✅ 3 أدوار مستخدمين (Admin, Writer, Publisher)
- ✅ إدارة المقالات (CRUD)
- ✅ إدارة الأقسام
- ✅ نظام استطلاعات الرأي
- ✅ نظام مراجعة ونشر المقالات
- ✅ تتبع المشاهدات
- ✅ RESTful API

## 📋 المتطلبات

- Node.js (v14 أو أحدث)
- MongoDB (محلي أو Atlas)
- npm أو yarn

## ⚙️ التثبيت

### 1. تثبيت الحزم

```bash
cd backend
npm install
```

### 2. إعداد البيئة

انسخ ملف `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم عدّل الملف `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB - استخدم واحدة من الطريقتين:
# قاعدة بيانات محلية:
MONGODB_URI=mongodb://localhost:27017/news-blog

# أو MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-blog

JWT_SECRET=your_super_secret_key_here_change_it
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

### 3. تشغيل MongoDB محلياً (إذا لم تستخدم Atlas)

```bash
# على Windows
mongod

# على Mac/Linux
sudo mongod
```

### 4. ملء قاعدة البيانات ببيانات تجريبية

```bash
npm run seed
```

هذا سينشئ:
- 3 مستخدمين (Admin, Writer, Publisher)
- 6 أقسام
- 6 مقالات
- 2 استطلاعات رأي

**بيانات تسجيل الدخول:**
- Admin: `admin@news.com` / `admin123`
- Writer: `writer@news.com` / `writer123`
- Publisher: `publisher@news.com` / `publisher123`

### 5. تشغيل السيرفر

```bash
# التشغيل العادي
npm start

# التشغيل مع auto-reload (للتطوير)
npm run dev
```

السيرفر سيعمل على: `http://localhost:5000`

## 📚 API Endpoints

### 🔐 المصادقة (Authentication)

```
POST   /api/auth/register      - تسجيل مستخدم جديد
POST   /api/auth/login         - تسجيل الدخول
GET    /api/auth/me            - معلومات المستخدم الحالي (محمي)
PUT    /api/auth/profile       - تحديث الملف الشخصي (محمي)
```

### 📰 المقالات (Articles)

```
GET    /api/articles           - جميع المقالات (عام)
GET    /api/articles/:id       - مقال واحد (عام)
POST   /api/articles/:id/view  - زيادة عدد المشاهدات (عام)
POST   /api/articles           - إنشاء مقال (محمي)
PUT    /api/articles/:id       - تحديث مقال (محمي)
DELETE /api/articles/:id       - حذف مقال (Admin فقط)
POST   /api/articles/:id/publish  - نشر مقال (Publisher/Admin)
POST   /api/articles/:id/reject   - رفض مقال (Publisher/Admin)
```

**Query Parameters للمقالات:**
- `status` - draft, pending, published, rejected
- `category` - معرف القسم
- `author` - معرف الكاتب
- `featured` - true/false
- `search` - بحث في العنوان والملخص
- `page` - رقم الصفحة
- `limit` - عدد العناصر في الصفحة

### 📁 الأقسام (Categories)

```
GET    /api/categories         - جميع الأقسام (عام)
GET    /api/categories/:id     - قسم واحد مع مقالاته (عام)
POST   /api/categories         - إنشاء قسم (Admin فقط)
PUT    /api/categories/:id     - تحديث قسم (Admin فقط)
DELETE /api/categories/:id     - حذف قسم (Admin فقط)
```

### 📊 الاستطلاعات (Polls)

```
GET    /api/polls              - جميع الاستطلاعات (عام)
GET    /api/polls/:id          - استطلاع واحد (عام)
POST   /api/polls/:id/vote     - التصويت (عام)
POST   /api/polls              - إنشاء استطلاع (Admin فقط)
PUT    /api/polls/:id          - تحديث استطلاع (Admin فقط)
DELETE /api/polls/:id          - حذف استطلاع (Admin فقط)
```

### 👥 المستخدمين (Users)

```
GET    /api/users              - جميع المستخدمين (Admin فقط)
GET    /api/users/:id          - مستخدم واحد (Admin فقط)
PUT    /api/users/:id          - تحديث مستخدم (Admin فقط)
DELETE /api/users/:id          - حذف مستخدم (Admin فقط)
PATCH  /api/users/:id/toggle-status  - تفعيل/تعطيل مستخدم (Admin فقط)
```

## 🔑 نظام الأدوار والصلاحيات

### Admin (المدير)
- جميع الصلاحيات
- إدارة المستخدمين
- إدارة الأقسام
- إدارة الاستطلاعات
- حذف المقالات

### Publisher (الناشر)
- مراجعة المقالات
- نشر المقالات
- رفض المقالات
- كتابة مقالات

### Writer (الكاتب)
- كتابة مقالات جديدة
- تعديل مقالاته فقط
- عرض مقالاته

## 📝 مثال على الاستخدام

### تسجيل الدخول

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@news.com',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.token; // احفظ هذا للطلبات القادمة
```

### إنشاء مقال

```javascript
const response = await fetch('http://localhost:5000/api/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // استخدم التوكن من تسجيل الدخول
  },
  body: JSON.stringify({
    title: 'عنوان المقال',
    summary: 'ملخص المقال',
    content: 'محتوى المقال الكامل...',
    category: 'category_id_here',
    tags: ['سياسة', 'أخبار']
  })
});
```

### جلب المقالات المنشورة

```javascript
const response = await fetch('http://localhost:5000/api/articles?status=published&page=1&limit=10');
const data = await response.json();
console.log(data.articles);
```

## 🗂️ هيكل المشروع

```
backend/
├── config/
│   └── db.js              # إعدادات MongoDB
├── controllers/
│   ├── authController.js   # التحكم بالمصادقة
│   ├── articleController.js
│   ├── categoryController.js
│   ├── pollController.js
│   └── userController.js
├── middleware/
│   ├── auth.js            # التحقق من JWT
│   └── roleCheck.js       # التحقق من الصلاحيات
├── models/
│   ├── User.js
│   ├── Article.js
│   ├── Category.js
│   └── Poll.js
├── routes/
│   ├── auth.js
│   ├── articles.js
│   ├── categories.js
│   ├── polls.js
│   └── users.js
├── seeders/
│   └── seed.js            # بيانات تجريبية
├── .env.example
├── package.json
└── server.js              # نقطة البداية
```

## 🧪 اختبار API

استخدم **Postman** أو **Thunder Client** لاختبار الـ API:

1. سجل دخول للحصول على التوكن
2. أضف التوكن في Header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## 🔒 الأمان

- كلمات المرور مشفرة باستخدام bcrypt
- JWT للمصادقة
- التحقق من الصلاحيات في كل Endpoint
- Validation على جميع المدخلات

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بـ MongoDB

```
Error connecting to MongoDB
```

**الحل:**
- تأكد من تشغيل MongoDB
- تحقق من `MONGODB_URI` في ملف `.env`

### خطأ في JWT

```
رمز الوصول غير صالح
```

**الحل:**
- تحقق من إرسال التوكن الصحيح
- التوكن ينتهي بعد 7 أيام (قم بتسجيل الدخول مجدداً)

## 📞 الدعم

للمساعدة أو الأسئلة، افتح Issue في المشروع.

---

Made with ❤️ for Arabic News Blogs
