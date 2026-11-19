# HISHAM WORLD - GitHub Pages

هذه نسخة مجهزة لمستودع باسم `hisham-world`.

1. افتح GitHub وأنشئ مستودع جديد `hisham-world` (عام Public على الخطة المجانية).
2. فك ضغط الأرشيف وارفع **محتويات** المجلد إلى جذر المستودع. لازم يظهر `package.json` و`vite.config.ts` و`.github/workflows/deploy.yml` في المصدر.
3. في GitHub: Settings > Pages > Build and deployment > Source > GitHub Actions.
4. افتح Actions وشغّل workflow `Deploy Hisham World to GitHub Pages` من Run workflow لو لم يبدأ تلقائيًا.
5. رابط الموقع المتوقع: https://abdelrhmanwaleed4.github.io/hisham-world/

## مهم
- الملف `.github/workflows/deploy.yml` يجب الحفاظ عليه. إخفاء الملفات ذات النقطة قد يمنع نسخه وقت الرفع.
- تستخدم النسخة مسار `/hisham-world/`. لو اخترت اسم مستودع مختلف يجب تغيير `base` في `vite.config.ts` والمسارات الأخرى.
- لا ترفع ملف ZIP نفسه داخل المستودع؛ ارفع الملفات والمجلدات.
- لم يتم اختبار البناء النهائي بسبب عدم توافر تثبيت كامل للمكتبات في البيئة الحالية.
- استخدم فقط الملفات الصوتية التي تملك حق نشرها.
