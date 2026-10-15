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
יש פרומטים מוכנים לזה ממש כאן למטה.

---

## הכתובת דלפה? פרומטים להחלפה

### רק שאלה: "איך מחליפים?"
מדביקים ב-claude.ai או בכל צ'אט עם Claude:

```
הכתובת של שרת ה-MCP של המזגן שלי (Sensibo על Vercel, לפי https://github.com/shmuelr16/tip-30-claude-sensibo) דלפה.
הכתובת בנויה כך: https://<הפרויקט>.vercel.app/mcp/<MCP_SECRET>.
תסביר לי צעד אחרי צעד, בעברית ובפשטות, איך:
1. ליצור MCP_SECRET חדש.
2. להחליף אותו ב-Vercel ולעשות Redeploy.
3. לבדוק שהכתובת הישנה כבר לא עובדת והחדשה כן.
4. לעדכן את הכתובת ב-claude.ai (Connectors) וב-Claude Code.
```

### Claude מחליף בשבילכם
מדביקים ב-[Claude Code](https://claude.com/claude-code), מתוך תיקיית הפרויקט:

```
הכתובת של שרת ה-MCP של המזגן שלי דלפה. תחליף אותה בשבילי:
1. צור MCP_SECRET חדש: מחרוזת אקראית של 48 תווים (openssl rand -hex 24).
2. החלף אותו ב-Vercel ב-production:
   npx vercel env rm MCP_SECRET production -y
   ואז הוסף את החדש עם npx vercel env add MCP_SECRET production.
3. פרוס מחדש: npx vercel --prod.
4. בדוק: tools/list לכתובת החדשה מחזיר 200, ולכתובת הישנה מחזיר 401.
5. עדכן את Claude Code:
   claude mcp remove sensibo
   claude mcp add --transport http sensibo <הכתובת החדשה>
6. תן לי את הכתובת החדשה, ותזכיר לי להחליף אותה ב-claude.ai:
   Settings ← Connectors ← Sensibo ← מחיקה והוספה מחדש עם הכתובת החדשה.
אל תשמור את הסוד בשום קובץ ואל תעשה לו commit.
```

---

## אוטומציה: בדיקת דליפה והחלפה לבד

משימה מתוזמנת של Claude שרצה כל שעה. בכל ריצה היא:

1. **בודקת אם הכתובת דלפה:**
   - מחפשת את הסוד ב-GitHub הציבורי (חיפוש קוד).
   - קוראת את הלוגים ב-Vercel. השרת כותב שורה `mcp_call` על כל קריאה, עם `user_agent` ו-`country` (בלי הסוד). קריאה עם סוד נכון ממקור שלא מוכר, זה סימן לדליפה.
2. **אם דלפה:** יוצרת `MCP_SECRET` חדש, מחליפה ב-Vercel, פורסת מחדש ובודקת שהכתובת החדשה עובדת והישנה לא.
3. **שולחת לכם התראה** להחליף את הכתובת בקונקטור. את הקונקטור ב-claude.ai אי אפשר לעדכן אוטומטית, רק אתם.
4. **שמה תזכורת ביומן גוגל** עם הכתובת החדשה והצעדים.
5. **אם לא דלפה:** לא עושה כלום ולא מטרידה.

### מה צריך
- [Claude Code באינטרנט](https://claude.ai/code), עם המאגר הזה מחובר.
- קונקטורים מחוברים ב-claude.ai: **Vercel** ו-**Google Calendar**.
- התראות פוש מופעלות לאפליקציית Claude בטלפון.

### הפרומט שיוצר את האוטומציה
מדביקים ב-Claude Code (באינטרנט או במחשב):

```
צור לי משימה מתוזמנת (scheduled task) שרצה כל שעה, בסשן חדש בכל פעם,
עם הקונקטורים Vercel ו-Google Calendar, והתראות פוש מופעלות.
זה הפרומט של המשימה:

---
אתה שומר על שרת ה-MCP של המזגן שלי (פרויקט Vercel בשם <שם הפרויקט>).
הכתובת שלו היא https://<הדומיין>/mcp/<MCP_SECRET>. מי שיש לו אותה שולט במזגן.

שלב 1, בדיקה:
- קרא את MCP_SECRET מה-Vercel של הפרויקט (production). לעולם אל תכתוב אותו בתשובה, בקובץ או ב-commit.
- חפש ב-GitHub (חיפוש קוד) את הסוד. כל תוצאה = דליפה.
- קרא את ה-runtime logs של הפרויקט מהשעה האחרונה. חפש שורות "mcp_call".
  מקורות מוכרים: user_agent של Claude (claude.ai / Claude Code) ומדינה IL.
  קריאה מוצלחת עם user_agent או מדינה אחרים = חשד לדליפה.
- אם אין דליפה: סיים בשורה אחת "הכתובת בסדר", בלי התראה ובלי אירוע ביומן.

שלב 2, רק אם יש דליפה, החלף:
- צור סוד חדש: 48 תווים אקראיים (openssl rand -hex 24).
- עדכן את MCP_SECRET ב-Vercel ל-production, ופרוס מחדש את הפריסה האחרונה של production.
- חכה שהפריסה תהיה READY, ובדוק: POST tools/list לכתובת החדשה מחזיר 200, ולישנה מחזיר 401.
  אם הבדיקה נכשלה, אל תמשיך. שלח לי התראה שההחלפה נכשלה ולמה.

שלב 3, תודיע לי:
- שלח התראת פוש: "כתובת המזגן הוחלפה בגלל <הסיבה>. החלף את הכתובת בקונקטור Sensibo ב-claude.ai. הפרטים ביומן."
- צור אירוע ביומן גוגל הראשי שלי, בעוד 15 דקות, ל-15 דקות, עם תזכורת קופצת 0 דקות לפני:
  כותרת: "🔑 להחליף כתובת בקונקטור המזגן"
  תיאור:
    הכתובת החדשה: <הכתובת המלאה החדשה>
    למה הוחלפה: <הסיבה>
    הצעדים:
    1. claude.ai ← Settings ← Connectors.
    2. מוחקים את הקונקטור Sensibo הישן.
    3. Add custom connector, שם: Sensibo, URL: הכתובת החדשה.
    4. Claude Code: claude mcp remove sensibo
       ואז: claude mcp add --transport http sensibo <הכתובת החדשה>
    5. בודקים: "אילו מזגנים יש לי?"
    6. מוחקים את האירוע הזה מהיומן, כי יש בו את הכתובת.
---
```

### כדאי לדעת
- **לוגים:** ב-Vercel בחינם, הלוגים נשמרים רק שעה. לכן המשימה רצה כל שעה ובודקת רק את השעה האחרונה.
- **הכתובת ביומן:** היא מופיעה באירוע, כדי שיהיה לכם נוח להעתיק. היומן שלכם פרטי, אבל מחקו את האירוע אחרי שעדכנתם.
- **התראות שווא:** הסתובבתם בחו"ל או חיברתם עוד לקוח? עדכנו את "מקורות מוכרים" בפרומט של המשימה.
- **החלפה ידנית בכל זמן:** אפשר להריץ את המשימה עכשיו, או להשתמש בפרומט "Claude מחליף בשבילכם" למעלה.
