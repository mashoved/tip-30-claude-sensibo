# טיפ #30: Claude שולט במזגן 🧊

בסוף המדריך תכתבו ל-Claude "תדליק את המזגן על 24", והמזגן יידלק.
זה עובד ב-claude.ai, באפליקציה בטלפון וב-Claude Code.

מהערוץ [מה שעובד](https://ma-shoved.vercel.app/).

---

## מה צריך

1. **מזגן עם שלט רחוק** ו-**Sensibo Sky** (מכשיר קטן שמדבר עם המזגן): [לקנייה](https://sensibo.com/products/sensibo-sky)
2. **מפתח API של Sensibo** (חינם): [מקבלים כאן](https://home.sensibo.com/me/api), אחרי התחברות
3. **חשבון Vercel** (חינם): [vercel.com](https://vercel.com)
4. **Claude**

תיעוד ה-API של Sensibo, למי שרוצה להעמיק: [support.sensibo.com/api](https://support.sensibo.com/api/)

---

## הדרך הקלה: Claude עושה הכל

פתחו את [Claude Code](https://claude.com/claude-code) והדביקו:

```
אני רוצה לשלוט במזגן שלי (Sensibo) דרך Claude. תעשה את זה בשבילי, צעד אחרי צעד:
1. שכפל את https://github.com/shmuelr16/tip-30-claude-sensibo לתיקייה חדשה.
2. בקש ממני את מפתח ה-API של Sensibo (אני לוקח אותו מ-https://home.sensibo.com/me/api). אל תשמור אותו בשום קובץ.
3. צור מחרוזת אקראית ארוכה בשביל MCP_SECRET.
4. העלה ל-Vercel עם npx vercel (תעזור לי להתחבר אם צריך).
   הגדר את SENSIBO_API_KEY ואת MCP_SECRET כמשתני סביבה ל-production, ופרוס עם npx vercel --prod.
5. בדוק שהשרת עובד: שלח tools/list לכתובת https://<הכתובת-שלי>/mcp/<MCP_SECRET>.
6. חבר אותו ל-Claude Code: claude mcp add --transport http sensibo <הכתובת המלאה>.
7. תן לי את הכתובת המלאה, כדי שאוסיף אותה גם ב-claude.ai.
8. בסוף, הפעל list_devices ותראה לי את המזגנים שלי.
```

זהו. Claude יעשה את כל השלבים שלמטה.

---

## הדרך הידנית: 4 צעדים

### 1. מכינים שני ערכים
- `SENSIBO_API_KEY`: המפתח מ-[home.sensibo.com/me/api](https://home.sensibo.com/me/api)
- `MCP_SECRET`: סיסמה שאתם ממציאים. ארוכה ואקראית, למשל `kfj38Dk2mzP9qLw7`

### 2. מעלים ל-Vercel
לוחצים על הכפתור, מתחברים, מדביקים את שני הערכים ולוחצים **Deploy**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshmuelr16%2Ftip-30-claude-sensibo&env=SENSIBO_API_KEY,MCP_SECRET&envDescription=SENSIBO_API_KEY%20from%20home.sensibo.com%2Fme%2Fapi%2C%20MCP_SECRET%20any%20long%20random%20string)

בסוף תקבלו כתובת, למשל `https://my-ac.vercel.app`.

הכתובת של השרת שלכם היא:
```
https://my-ac.vercel.app/mcp/<MCP_SECRET>
```

### 3. נותנים ל-Claude גישה
- **claude.ai או האפליקציה:** Settings ← Connectors ← **Add custom connector**. בשם כותבים `Sensibo`, וב-URL מדביקים את הכתובת מצעד 2.
- **Claude Code:**
  ```
  claude mcp add --transport http sensibo https://my-ac.vercel.app/mcp/<MCP_SECRET>
  ```

### 4. מנסים
כותבים ל-Claude:
- "אילו מזגנים יש לי?"
- "מה המצב של המזגן בסלון?"
- "תדליק את המזגן על קירור 24"
- "חם לי"

---

## פרומט שימוש (רשות)

אפשר להדביק את זה בהוראות של Project ב-Claude, כדי ש-Claude יתנהג יפה עם המזגן:

```
יש לך גישה למזגן שלי דרך כלי Sensibo.
- לפני כל שינוי, בדוק את המצב עם get_ac_status.
- "חם לי": אם המזגן כבוי, הדלק אותו על קירור 24. אם הוא דולק, הורד 2 מעלות.
- "קר לי": העלה 2 מעלות, או כבה אם כבר 27 ומעלה.
- טמפרטורה רק בין 18 ל-28.
- יש כמה מזגנים ולא אמרתי איזה? שאל אותי.
- אחרי כל פעולה, כתוב בשורה אחת מה המצב עכשיו.
```

---

## מה יש בשרת

קובץ אחד, [`api/mcp.js`](api/mcp.js), בלי ספריות. הכלים ש-Claude מקבל:

| כלי | מה הוא עושה |
|---|---|
| `list_devices` | רשימת המזגנים והחדרים |
| `get_ac_status` | מצב המזגן, טמפרטורה ולחות בחדר |
| `turn_on_ac` / `turn_off_ac` | הדלקה / כיבוי |
| `set_temperature` | טמפרטורה (16 עד 30) |
| `set_mode` | קירור / חימום / ייבוש / אוטומטי / מאוורר |
| `set_fan_level` | עוצמת מאוורר |

רשות: הוסיפו ב-Vercel משתנה `DEFAULT_DEVICE_ID` עם ה-id של המזגן הראשי. כך Claude לא צריך לשאול איזה מזגן.

---

## משהו לא עובד?

| מה רואים | מה לעשות |
|---|---|
| `Wrong or missing secret` | הסוד בסוף הכתובת לא תואם ל-`MCP_SECRET` ב-Vercel |
| `Set SENSIBO_API_KEY and MCP_SECRET` | חסר משתנה ב-Vercel. מוסיפים אותו ועושים Redeploy |
| `Sensibo 401` / `403` | מפתח ה-API שגוי. יוצרים חדש ב-home.sensibo.com/me/api |
| `No device_id` | אומרים ל-Claude "תריץ list_devices", או מגדירים `DEFAULT_DEVICE_ID` |

## אבטחה
מי שיש לו את הכתובת המלאה יכול לשלוט במזגן שלכם. אל תשתפו אותה.
דלפה? משנים את `MCP_SECRET` ב-Vercel, עושים Redeploy ומעדכנים את הכתובת ב-Claude.
