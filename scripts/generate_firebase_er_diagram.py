from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"
OUT_DIR.mkdir(exist_ok=True)
PNG_PATH = OUT_DIR / "diagrama_relacional_firebase_automotrizrd.png"

FONT_DIR = Path("C:/Windows/Fonts")
FONT = str(FONT_DIR / "arial.ttf")
FONT_BOLD = str(FONT_DIR / "arialbd.ttf")

W, H = 2800, 1800
BG = "#F7FAFC"
CARD = "#FFFFFF"
CARD_ALT = "#F1F8F8"
PRIMARY = "#123A5D"
ACCENT = "#0F8B8D"
TEXT = "#20252B"
MUTED = "#607080"
BORDER = "#B9C7D5"
LINE = "#365A6C"
PK = "#E9F3FF"
FK = "#EAF7F4"


class TableBox:
    def __init__(self, key, title, fields, x, y, w=360):
        self.key = key
        self.title = title
        self.fields = fields
        self.x = x
        self.y = y
        self.w = w
        self.row_h = 35
        self.header_h = 48
        self.h = self.header_h + len(fields) * self.row_h + 16

    @property
    def left(self):
        return self.x

    @property
    def right(self):
        return self.x + self.w

    @property
    def top(self):
        return self.y

    @property
    def bottom(self):
        return self.y + self.h

    @property
    def center(self):
        return (self.x + self.w / 2, self.y + self.h / 2)

    def anchor(self, side):
        if side == "left":
            return (self.left, self.y + self.h / 2)
        if side == "right":
            return (self.right, self.y + self.h / 2)
        if side == "top":
            return (self.x + self.w / 2, self.top)
        return (self.x + self.w / 2, self.bottom)


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)


def draw_round_rect(draw, box, radius, fill, outline, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_table(draw, t):
    shadow = (t.x + 6, t.y + 8, t.x + t.w + 6, t.y + t.h + 8)
    draw_round_rect(draw, shadow, 14, "#DDE6EE", "#DDE6EE", 1)
    draw_round_rect(draw, (t.x, t.y, t.x + t.w, t.y + t.h), 14, CARD, BORDER, 2)
    draw.rounded_rectangle((t.x, t.y, t.x + t.w, t.y + t.header_h), radius=14, fill=PRIMARY)
    draw.rectangle((t.x, t.y + t.header_h - 14, t.x + t.w, t.y + t.header_h), fill=PRIMARY)
    draw.text((t.x + 18, t.y + 13), t.title, fill="white", font=font(22, True))

    y = t.y + t.header_h + 8
    for label, kind in t.fields:
        pill_fill = PK if kind == "PK" else FK if kind == "FK" else "#F7F9FB"
        tag_fill = PRIMARY if kind == "PK" else ACCENT if kind == "FK" else MUTED
        draw.rounded_rectangle((t.x + 14, y + 5, t.x + 58, y + 27), radius=10, fill=pill_fill, outline="#D8E3ED")
        draw.text((t.x + 24, y + 8), kind, fill=tag_fill, font=font(12, True))
        draw.text((t.x + 70, y + 5), label, fill=TEXT, font=font(17))
        y += t.row_h


def elbow(draw, start, end, label=None, bend="hv", color=LINE):
    x1, y1 = start
    x2, y2 = end
    if bend == "hv":
        mid = (x2, y1)
        points = [start, mid, end]
    elif bend == "vh":
        mid = (x1, y2)
        points = [start, mid, end]
    else:
        mx = (x1 + x2) / 2
        points = [start, (mx, y1), (mx, y2), end]

    draw.line(points, fill=color, width=3, joint="curve")
    r = 6
    draw.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=color)
    draw.polygon([(x2, y2), (x2 - 12, y2 - 7), (x2 - 12, y2 + 7)], fill=color)

    if label:
        lx = sum(p[0] for p in points) / len(points)
        ly = sum(p[1] for p in points) / len(points)
        bbox = draw.textbbox((0, 0), label, font=font(15, True))
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.rounded_rectangle((lx - tw / 2 - 10, ly - th / 2 - 6, lx + tw / 2 + 10, ly + th / 2 + 8), radius=8, fill=BG, outline=BORDER)
        draw.text((lx - tw / 2, ly - th / 2 - 1), label, fill=PRIMARY, font=font(15, True))


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw.text((W / 2, 45), "AutomotrizRD - Diagrama Relacional de Firebase", fill=PRIMARY, font=font(42, True), anchor="mm")
    draw.text(
        (W / 2, 92),
        "Vista conceptual tipo ERD: Firestore se implementa con colecciones/subcolecciones, pero estas son las relaciones logicas para programar el MVP.",
        fill=MUTED,
        font=font(23),
        anchor="mm",
    )

    tables = [
        TableBox("users", "users", [("uid", "PK"), ("displayName", "COL"), ("email", "COL"), ("role", "COL"), ("mainVehicleId", "FK")], 120, 190),
        TableBox("vehicles", "vehicles", [("vehicleId", "PK"), ("ownerId", "FK"), ("brand/model/year", "COL"), ("fuelType", "COL"), ("avgConsumption", "COL")], 570, 190),
        TableBox("fuel", "fuelFillUps", [("fillUpId", "PK"), ("vehicleId", "FK"), ("ownerId", "FK"), ("liters", "COL"), ("totalAmount", "COL"), ("odometerKm", "COL")], 1030, 170),
        TableBox("stats", "monthlyStats", [("YYYY-MM", "PK"), ("vehicleId", "FK"), ("fuelCost", "COL"), ("liters", "COL"), ("kmDriven", "COL")], 1490, 190),
        TableBox("docs", "vehicleDocuments", [("documentId", "PK"), ("vehicleId", "FK"), ("type", "COL"), ("expiresAt", "COL"), ("filePath", "COL")], 1950, 190),
        TableBox("expenses", "expenses", [("expenseId", "PK"), ("vehicleId", "FK"), ("category", "COL"), ("amount", "COL"), ("date", "COL")], 2360, 190),

        TableBox("fuelPrice", "fuelPriceHistory", [("dateId", "PK"), ("countryCode", "COL"), ("regular", "COL"), ("premium", "COL"), ("diesel/glp", "COL")], 120, 650),
        TableBox("stations", "gasStations", [("stationId", "PK"), ("brand/name", "COL"), ("location", "COL"), ("geohash", "COL"), ("services", "COL")], 570, 650),
        TableBox("stationReports", "stationPriceReports", [("reportId", "PK"), ("stationId", "FK"), ("userId", "FK"), ("fuelType", "COL"), ("price", "COL")], 1030, 650),
        TableBox("workshops", "workshops", [("workshopId", "PK"), ("ownerUid", "FK"), ("type", "COL"), ("services", "COL"), ("location", "COL")], 1490, 650),
        TableBox("appointments", "appointments", [("appointmentId", "PK"), ("userId", "FK"), ("vehicleId", "FK"), ("workshopId", "FK"), ("status", "COL")], 1950, 650),
        TableBox("workOrders", "workOrders", [("workOrderId", "PK"), ("appointmentId", "FK"), ("vehicleId", "FK"), ("workshopId", "FK"), ("status", "COL")], 2360, 650),

        TableBox("maintenance", "maintenanceRecords", [("recordId", "PK"), ("vehicleId", "FK"), ("serviceTypeId", "FK"), ("odometerKm", "COL"), ("nextDueAt", "COL")], 570, 1120),
        TableBox("serviceTypes", "serviceTypes", [("serviceTypeId", "PK"), ("name", "COL"), ("category", "COL"), ("intervalKm", "COL")], 1030, 1138),
        TableBox("estimates", "estimates", [("estimateId", "PK"), ("workOrderId", "FK"), ("userId", "FK"), ("workshopId", "FK"), ("total", "COL")], 1490, 1120),
        TableBox("notifications", "notifications", [("notificationId", "PK"), ("userId", "FK"), ("type", "COL"), ("deepLink", "COL"), ("readAt", "COL")], 1950, 1120),
        TableBox("community", "communityPosts", [("postId", "PK"), ("authorId", "FK"), ("vehicleId", "FK"), ("category", "COL"), ("status", "COL")], 2360, 1120),
    ]

    for t in tables:
        draw_table(draw, t)

    lookup = {t.key: t for t in tables}
    rels = [
        ("users", "right", "vehicles", "left", "1:N"),
        ("vehicles", "right", "fuel", "left", "1:N"),
        ("fuel", "right", "stats", "left", "N:1 agg."),
        ("vehicles", "right", "docs", "left", "1:N"),
        ("vehicles", "right", "expenses", "left", "1:N"),
        ("stations", "right", "stationReports", "left", "1:N"),
        ("workshops", "right", "appointments", "left", "1:N"),
        ("appointments", "right", "workOrders", "left", "1:1/N"),
        ("serviceTypes", "left", "maintenance", "right", "1:N"),
        ("workOrders", "bottom", "estimates", "top", "1:N"),
    ]

    for a, aside, b, bside, label in rels:
        start = lookup[a].anchor(aside)
        end = lookup[b].anchor(bside)
        bend = "mid" if aside in ("right", "left") and bside in ("right", "left") else "vh"
        if aside in ("bottom", "top"):
            bend = "vh"
        elbow(draw, start, end, label=label, bend=bend)

    legend_x, legend_y = 120, 1600
    draw_round_rect(draw, (legend_x, legend_y, legend_x + 900, legend_y + 115), 14, CARD_ALT, BORDER, 2)
    draw.text((legend_x + 24, legend_y + 20), "Leyenda", fill=PRIMARY, font=font(22, True))
    draw.rounded_rectangle((legend_x + 25, legend_y + 62, legend_x + 80, legend_y + 92), radius=10, fill=PK, outline="#D8E3ED")
    draw.text((legend_x + 40, legend_y + 68), "PK", fill=PRIMARY, font=font(14, True))
    draw.text((legend_x + 95, legend_y + 65), "Clave primaria / ID del documento", fill=TEXT, font=font(18))
    draw.rounded_rectangle((legend_x + 420, legend_y + 62, legend_x + 475, legend_y + 92), radius=10, fill=FK, outline="#D8E3ED")
    draw.text((legend_x + 435, legend_y + 68), "FK", fill=ACCENT, font=font(14, True))
    draw.text((legend_x + 490, legend_y + 65), "Referencia logica a otra coleccion", fill=TEXT, font=font(18))

    note = (
        "Nota: para evitar cruces, algunas relaciones a users y vehicles se indican solo con FK dentro de la tabla. "
        "En Firestore, fuelFillUps, maintenanceRecords y vehicleDocuments pueden vivir como subcolecciones de vehicles."
    )
    draw.text((1100, 1640), note, fill=MUTED, font=font(20))

    img.save(PNG_PATH, quality=95)
    print(PNG_PATH)


if __name__ == "__main__":
    main()
