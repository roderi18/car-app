from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"
OUT_DIR.mkdir(exist_ok=True)
PDF_PATH = OUT_DIR / "esquema_firebase_automotrizrd.pdf"


PRIMARY = colors.HexColor("#123A5D")
ACCENT = colors.HexColor("#0F8B8D")
LIGHT = colors.HexColor("#EAF3F4")
DARK = colors.HexColor("#20252B")
MUTED = colors.HexColor("#5A6673")
BORDER = colors.HexColor("#CBD5DF")
CODE_BG = colors.HexColor("#F5F7FA")


def pstyle():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleMain",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            textColor=PRIMARY,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Subtitle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1x",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=PRIMARY,
            spaceBefore=12,
            spaceAfter=7,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2x",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=ACCENT,
            spaceBefore=10,
            spaceAfter=5,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Bodyx",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=13,
            textColor=DARK,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=10.5,
            textColor=DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHead",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.2,
            leading=10,
            textColor=colors.white,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.7,
            leading=9.6,
            textColor=DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CodeBlock",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=7.2,
            leading=9.2,
            textColor=colors.HexColor("#27313A"),
            backColor=CODE_BG,
            borderColor=BORDER,
            borderWidth=0.4,
            borderPadding=5,
            spaceBefore=3,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Callout",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=PRIMARY,
            backColor=LIGHT,
            borderColor=ACCENT,
            borderWidth=0.7,
            borderPadding=7,
            spaceBefore=5,
            spaceAfter=9,
        )
    )
    return styles


S = pstyle()


def esc(text):
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )


def P(text, style="Bodyx"):
    return Paragraph(esc(text), S[style])


def code(text):
    return Paragraph(esc(text), S["CodeBlock"])


def bullets(items):
    return ListFlowable(
        [ListItem(P(item, "Bodyx"), leftIndent=12) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=6,
        bulletColor=ACCENT,
    )


def table(rows, widths, repeat=1):
    data = []
    for i, row in enumerate(rows):
        style = "TableHead" if i < repeat else "TableCell"
        data.append([Paragraph(esc(cell), S[style]) for cell in row])
    t = Table(data, colWidths=widths, repeatRows=repeat, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, repeat - 1), PRIMARY),
                ("TEXTCOLOR", (0, 0), (-1, repeat - 1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("ROWBACKGROUNDS", (0, repeat), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PRIMARY)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(inch * 0.72, letter[1] - 0.45 * inch, "AutomotrizRD - Esquema Firebase")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(letter[0] - 0.72 * inch, 0.45 * inch, f"Pagina {doc.page}")
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(inch * 0.72, letter[1] - 0.55 * inch, letter[0] - 0.72 * inch, letter[1] - 0.55 * inch)
    canvas.restoreState()


def collection_block(name, purpose, owner, fields, subcollections=None, notes=None):
    story = [P(name, "H2x"), P(f"Proposito: {purpose}", "Bodyx"), P(f"Propiedad/acceso: {owner}", "Bodyx")]
    rows = [["Campo", "Tipo", "Requerido", "Notas"]]
    rows.extend(fields)
    story.append(table(rows, [1.45 * inch, 1.05 * inch, 0.7 * inch, 3.35 * inch]))
    if subcollections:
        story.append(P("Subcolecciones sugeridas", "Small"))
        story.append(bullets(subcollections))
    if notes:
        story.append(P(notes, "Small"))
    story.append(Spacer(1, 8))
    return story


def build():
    story = []
    story.append(P("Esquema de Base de Datos Firebase", "TitleMain"))
    story.append(
        P(
            "AutomotrizRD | Firestore, Firebase Auth, Storage y funciones recomendadas para el MVP y crecimiento posterior. "
            f"Documento generado el {date.today().isoformat()}.",
            "Subtitle",
        )
    )
    story.append(
        P(
            "Recomendacion central: iniciar con un MVP util para conductores en Republica Dominicana: registro, perfil, vehiculos, "
            "precios de combustible, historial de llenados, calculos de consumo, talleres/servicios, citas, presupuesto simple y ruta "
            "de mantenimiento. La comunidad, marketplace, OCR y comparador completo pueden quedar preparados en el modelo, pero desactivados hasta que exista traccion.",
            "Callout",
        )
    )

    story.append(P("1. Arquitectura Recomendada", "H1x"))
    story.append(
        table(
            [
                ["Servicio Firebase", "Uso recomendado"],
                ["Firebase Auth", "Login por correo, Google, Apple, Facebook y proveedores futuros. El UID de Auth sera la llave principal de users/{uid}."],
                ["Cloud Firestore", "Base principal para usuarios, vehiculos, combustible, talleres, citas, mantenimiento, presupuestos, notificaciones y comunidad futura."],
                ["Firebase Storage", "Fotos de perfil, vehiculos, talleres, documentos del vehiculo, evidencias de mantenimiento y adjuntos de comunidad."],
                ["Cloud Functions", "Calculos agregados, envio de notificaciones, expiracion de solicitudes, actualizacion semanal de combustibles y moderacion basica."],
                ["Cloud Messaging", "Alertas de combustible, recordatorios de mantenimiento, confirmaciones de citas y cambios de estado del taller."],
            ],
            [1.55 * inch, 5.0 * inch],
        )
    )
    story.append(
        P(
            "Convencion: usar IDs generados por Firestore salvo users/{uid}, docs con fechas como YYYY-MM-DD y estadisticas mensuales como YYYY-MM. "
            "Todos los documentos deben incluir createdAt, updatedAt y, cuando aplique, status.",
            "Bodyx",
        )
    )

    story.append(P("2. Colecciones Principales", "H1x"))

    collections = [
        (
            "users/{uid}",
            "Perfil del conductor o negocio y preferencias globales de la cuenta.",
            "El usuario lee/escribe su documento. Admin puede leer/moderar. Campos sensibles deben mantenerse minimos.",
            [
                ["displayName", "string", "si", "Nombre visible."],
                ["email", "string", "si", "Sincronizado con Firebase Auth."],
                ["phone", "string", "no", "Telefono local o WhatsApp."],
                ["photoURL", "string", "no", "Ruta publica o Storage path."],
                ["role", "string", "si", "driver | workshop_owner | admin."],
                ["city", "string", "no", "Santo Domingo, Santiago, etc."],
                ["countryCode", "string", "si", "DO por defecto."],
                ["mainVehicleId", "ref/string", "no", "Vehiculo principal para el dashboard."],
                ["notificationPrefs", "map", "si", "Combustible, citas, mantenimiento, promociones."],
                ["createdAt/updatedAt", "timestamp", "si", "Server timestamp."],
            ],
            [
                "deviceTokens/{tokenId}: token FCM, platform, active, lastSeenAt.",
                "favoriteWorkshops/{workshopId}: referencia rapida a talleres favoritos.",
                "favoriteStations/{stationId}: gasolineras favoritas.",
                "savedPosts/{postId}: comunidad futura.",
            ],
            None,
        ),
        (
            "vehicles/{vehicleId}",
            "Garage del usuario y ficha tecnica basica para calculos de combustible y mantenimiento.",
            "Lectura/escritura por ownerId. Taller puede leer solo si existe cita/orden vinculada y autorizada.",
            [
                ["ownerId", "string", "si", "UID del usuario."],
                ["brand/model/year", "string/number", "si", "Marca, modelo y ano."],
                ["trim", "string", "no", "Version del vehiculo."],
                ["plate", "string", "no", "Placa. Considerar privacidad."],
                ["fuelType", "string", "si", "regular | premium | diesel | glp | gnv | electric | hybrid."],
                ["tankCapacityLiters", "number", "no", "Capacidad de tanque."],
                ["avgConsumptionLPer100Km", "number", "no", "Consumo promedio manual o calculado."],
                ["odometerKm", "number", "no", "Kilometraje actual."],
                ["isPrimary", "boolean", "si", "Vehiculo principal."],
                ["photoUrls", "array", "no", "Fotos del vehiculo."],
                ["status", "string", "si", "active | archived | sold."],
            ],
            [
                "fuelFillUps/{fillUpId}: cada llenado de combustible.",
                "maintenanceRecords/{recordId}: servicios, cambios, historial y recordatorios.",
                "vehicleDocuments/{documentId}: marbete, seguro, matricula, inspecciones.",
                "expenses/{expenseId}: gastos manuales o generados por llenados/mantenimientos.",
                "monthlyStats/{YYYY-MM}: cache de consumo, km y gasto mensual.",
            ],
            "Mantener vehicles como coleccion raiz facilita consultas, estadisticas y acceso compartido con talleres sin duplicar datos.",
        ),
        (
            "vehicles/{vehicleId}/fuelFillUps/{fillUpId}",
            "Bitacora de llenados para consumo real, gasto mensual/anual y costo por kilometro.",
            "Solo ownerId y admins. Se puede consultar por collection group con ownerId.",
            [
                ["ownerId", "string", "si", "UID duplicado para reglas e indices."],
                ["vehicleId", "string", "si", "ID del vehiculo padre."],
                ["date", "timestamp", "si", "Fecha de llenado."],
                ["stationId", "string", "no", "Gasolinera elegida."],
                ["fuelType", "string", "si", "Tipo usado."],
                ["liters", "number", "si", "Litros comprados."],
                ["pricePerLiter", "number", "si", "RD$ por litro."],
                ["totalAmount", "number", "si", "Liters * pricePerLiter o monto manual."],
                ["odometerKm", "number", "no", "Kilometraje al llenar."],
                ["fullTank", "boolean", "no", "Ayuda a calcular consumo real."],
                ["notes", "string", "no", "Comentario opcional."],
            ],
            None,
            None,
        ),
        (
            "fuelPriceCurrent/{countryCode}",
            "Precio vigente por tipo de combustible para RD y calculadoras.",
            "Lectura publica. Escritura solo admin/function.",
            [
                ["countryCode", "string", "si", "DO."],
                ["effectiveFrom", "timestamp", "si", "Inicio de vigencia."],
                ["source", "string", "si", "Fuente oficial o carga admin."],
                ["prices", "map", "si", "regular, premium, dieselRegular, dieselOptimo, glp, gnv."],
                ["unit", "string", "si", "DOP/gal o DOP/liter. Elegir una unidad interna."],
                ["updatedAt", "timestamp", "si", "Ultima actualizacion."],
            ],
            None,
            "Para calculos internos conviene guardar precio por litro; si la fuente publica precio por galon, convertir tambien y conservar originalPricePerGallon.",
        ),
        (
            "fuelPriceHistory/{YYYY-MM-DD}",
            "Historico semanal/mensual/anual de combustibles para graficas y tendencias.",
            "Lectura publica. Escritura admin/function.",
            [
                ["countryCode", "string", "si", "DO."],
                ["effectiveFrom/effectiveTo", "timestamp", "si", "Rango de vigencia."],
                ["prices", "map", "si", "Mismos campos que fuelPriceCurrent."],
                ["sourceUrl", "string", "no", "Fuente de auditoria."],
                ["createdAt", "timestamp", "si", "Carga al sistema."],
            ],
            None,
            None,
        ),
        (
            "gasStations/{stationId}",
            "Mapa de gasolineras, favoritos, cercanas y comparacion por servicios/precios.",
            "Lectura publica. Reportes por usuarios; datos oficiales por admin.",
            [
                ["name", "string", "si", "Nombre de estacion."],
                ["brand", "string", "no", "Texaco, Shell, Isla, Total, Next, Eco, otro."],
                ["address", "map", "si", "Calle, ciudad, provincia, pais."],
                ["location", "GeoPoint", "si", "Lat/lng."],
                ["geohash", "string", "si", "Consultas por cercania."],
                ["services", "array", "no", "Tienda, aire, lavado, banos, 24h."],
                ["currentPrices", "map", "no", "Si se capturan precios por estacion."],
                ["ratingAvg/reviewsCount", "number", "no", "Para futuro."],
                ["status", "string", "si", "active | pending | closed."],
            ],
            [
                "priceReports/{reportId}: precio reportado por usuario, foto opcional, confidenceScore.",
                "reviews/{reviewId}: calificacion futura.",
            ],
            None,
        ),
        (
            "workshops/{workshopId}",
            "Directorio de talleres, mecanicos, repuestos, gomeras, gruas y lavaderos.",
            "Lectura publica. Owner/admin edita perfil segun verificacion.",
            [
                ["ownerUid", "string", "no", "UID del negocio si reclama perfil."],
                ["type", "string", "si", "workshop | mechanic | parts | tire_shop | tow | car_wash | station."],
                ["name", "string", "si", "Nombre del negocio."],
                ["phone/whatsapp/email", "string", "no", "Canales de contacto."],
                ["address", "map", "si", "Direccion normalizada."],
                ["location/geohash", "GeoPoint/string", "si", "Mapa y cercania."],
                ["services", "array", "si", "Mecanica, aceite, transmision, frenos, bateria, etc."],
                ["brandsSupported", "array", "no", "Toyota, Honda, Mazda, etc."],
                ["hours", "map", "no", "Horario por dia."],
                ["photos", "array", "no", "Logo/fotos del taller."],
                ["verificationStatus", "string", "si", "unverified | pending | verified | rejected."],
                ["ratingAvg/reviewsCount", "number", "si", "0 al iniciar."],
                ["status", "string", "si", "active | hidden | suspended."],
            ],
            [
                "serviceCatalog/{serviceId}: nombre, precioDesde, duracionEstimada, categoria.",
                "reviews/{reviewId}: resenas verificadas despues de servicio.",
                "availability/{YYYY-MM-DD}: cupos si se implementa agenda real.",
            ],
            None,
        ),
        (
            "appointments/{appointmentId}",
            "Solicitud y confirmacion de cita entre usuario, vehiculo y taller/servicio.",
            "Usuario, taller asignado y admin. Reglas basadas en userId/workshopId.",
            [
                ["userId", "string", "si", "Solicitante."],
                ["vehicleId", "string", "si", "Vehiculo asociado."],
                ["workshopId", "string", "si", "Taller/servicio solicitado."],
                ["serviceType", "string", "si", "Aceite, diagnostico, frenos, etc."],
                ["status", "string", "si", "requested | confirmed | cancelled | completed | no_show."],
                ["preferredDate", "timestamp", "si", "Fecha solicitada."],
                ["scheduledStartAt", "timestamp", "no", "Fecha confirmada."],
                ["notes", "string", "no", "Descripcion del problema."],
                ["contactSnapshot", "map", "si", "Nombre/telefono al momento."],
                ["createdAt/updatedAt", "timestamp", "si", "Auditoria."],
            ],
            None,
            None,
        ),
        (
            "workOrders/{workOrderId}",
            "Ruta de mantenimiento simple y estado del trabajo en taller.",
            "Usuario ve su orden; taller actualiza estados; admin modera.",
            [
                ["appointmentId", "string", "no", "Cita origen."],
                ["userId/vehicleId/workshopId", "string", "si", "Relaciones principales."],
                ["status", "string", "si", "scheduled | received | diagnosis | waiting_approval | approved | in_progress | ready | delivered."],
                ["currentStep", "number", "no", "Orden visual del progreso."],
                ["odometerIn/odometerOut", "number", "no", "Kilometraje entrada/salida."],
                ["diagnosis", "string", "no", "Resumen tecnico."],
                ["estimatedReadyAt", "timestamp", "no", "Hora estimada de entrega."],
                ["totalApproved", "number", "no", "Costo aprobado."],
                ["timeline", "array", "si", "Eventos: status, at, by, comment, photoUrls."],
            ],
            [
                "updates/{updateId}: cambios de estado con comentario, foto y autor.",
                "photos/{photoId}: evidencia del taller.",
            ],
            "Duplicar timeline corto en la orden mejora el render del progreso; updates conserva historial completo.",
        ),
        (
            "estimates/{estimateId}",
            "Presupuesto simple para aprobar o rechazar antes del trabajo.",
            "Usuario, taller y admin.",
            [
                ["userId/vehicleId/workshopId", "string", "si", "Relaciones."],
                ["appointmentId/workOrderId", "string", "no", "Origen si aplica."],
                ["status", "string", "si", "draft | sent | approved | rejected | expired."],
                ["items", "array", "si", "Servicio, mano de obra, pieza, cantidad, precio."],
                ["laborTotal/partsTotal", "number", "si", "Subtotales."],
                ["taxes/discount", "number", "no", "Si aplica."],
                ["total", "number", "si", "Total RD$."],
                ["customerComment", "string", "no", "Motivo al rechazar o nota."],
                ["expiresAt", "timestamp", "no", "Vigencia del presupuesto."],
            ],
            None,
            "Para presupuestos largos, mover items a estimates/{id}/items/{itemId}. Para MVP, array es suficiente.",
        ),
        (
            "notifications/{notificationId}",
            "Centro de notificaciones y registro de mensajes enviados.",
            "Cada usuario lee sus notificaciones. Escritura por functions/admin.",
            [
                ["userId", "string", "si", "Destinatario."],
                ["type", "string", "si", "fuel_alert | maintenance_due | appointment | work_order | estimate | community."],
                ["title/body", "string", "si", "Texto mostrado."],
                ["deepLink", "string", "no", "Ruta dentro de la app."],
                ["data", "map", "no", "IDs relacionados."],
                ["readAt", "timestamp", "no", "Nulo si no leida."],
                ["createdAt", "timestamp", "si", "Fecha."],
            ],
            None,
            None,
        ),
        (
            "communityPosts/{postId} (fase 2)",
            "Comunidad tipo Reddit/Facebook enfocada en vehiculos.",
            "Autor edita su post; lectura publica/moderada; admin modera reportes.",
            [
                ["authorId", "string", "si", "UID del usuario."],
                ["category", "string", "si", "mechanic | fuel | workshops | parts | accidents | mods | insurance | sale."],
                ["title/body", "string", "si", "Contenido."],
                ["photoUrls", "array", "no", "Adjuntos."],
                ["vehicleId", "string", "no", "Si el usuario lo vincula."],
                ["likesCount/commentsCount", "number", "si", "Contadores."],
                ["status", "string", "si", "active | hidden | flagged | deleted."],
            ],
            [
                "comments/{commentId}: authorId, body, status, createdAt.",
                "likes/{uid}: createdAt.",
                "reports/{reportId}: reason, reporterId, createdAt.",
            ],
            "Prepararla como fase 2 evita redisenar, pero no hace falta mostrarla en el MVP si el foco es utilidad diaria.",
        ),
    ]

    for block in collections:
        story.extend(collection_block(*block))

    story.append(PageBreak())
    story.append(P("3. Colecciones de Soporte y Catalogos", "H1x"))
    story.append(
        table(
            [
                ["Coleccion", "Uso", "Campos principales"],
                ["appConfig/{env}", "Feature flags y configuracion remota basica.", "enabledModules, minAppVersion, supportLinks, fuelUnit, defaultCountry."],
                ["vehicleCatalog/{makeId}", "Catalogo simple de marcas/modelos para busqueda.", "make, models[], countryAvailability, status."],
                ["serviceTypes/{serviceTypeId}", "Servicios de mantenimiento y talleres.", "name, category, recommendedIntervalKm, recommendedIntervalMonths, icon, status."],
                ["fuelAlerts/{alertId}", "Alertas personales de precio/semana.", "userId, fuelType, condition, targetPrice, active, lastTriggeredAt."],
                ["tripEstimates/{estimateId}", "Viajes guardados si el usuario quiere historial.", "userId, vehicleId, origin, destination, distanceKm, fuelCostOneWay, fuelCostRoundTrip."],
                ["businessClaims/{claimId}", "Reclamo de taller/servicio por dueno.", "workshopId, userId, documents, status, reviewedBy, reviewedAt."],
                ["incidentReports/{reportId}", "Reportes ciudadanos: accidente, tapon, combustible agotado, cierre.", "userId, type, location, geohash, description, status, expiresAt."],
                ["reviews/{reviewId}", "Opcion raiz si prefieres todas las resenas centralizadas.", "targetType, targetId, userId, rating, body, verifiedServiceId, status."],
            ],
            [1.65 * inch, 2.35 * inch, 2.55 * inch],
        )
    )

    story.append(P("4. Relaciones Clave", "H1x"))
    story.append(code(
        "Firebase Auth uid -> users/{uid}\n"
        "users/{uid}.mainVehicleId -> vehicles/{vehicleId}\n"
        "vehicles/{vehicleId}.ownerId -> users/{uid}\n"
        "appointments/{id}.userId -> users/{uid}\n"
        "appointments/{id}.vehicleId -> vehicles/{vehicleId}\n"
        "appointments/{id}.workshopId -> workshops/{workshopId}\n"
        "workOrders/{id}.appointmentId -> appointments/{appointmentId}\n"
        "estimates/{id}.workOrderId -> workOrders/{workOrderId}\n"
        "notifications/{id}.data.refId -> appointment/workOrder/estimate/fuelAlert/etc."
    ))

    story.append(P("5. Ejemplos JSON Minimos", "H1x"))
    story.append(P("Vehiculo", "H2x"))
    story.append(code(
        "{\n"
        "  \"ownerId\": \"uid_123\",\n"
        "  \"brand\": \"Mazda\",\n"
        "  \"model\": \"Mazda 2\",\n"
        "  \"year\": 2014,\n"
        "  \"fuelType\": \"gasoline_regular\",\n"
        "  \"tankCapacityLiters\": 43,\n"
        "  \"avgConsumptionLPer100Km\": 6.5,\n"
        "  \"odometerKm\": 125000,\n"
        "  \"isPrimary\": true,\n"
        "  \"status\": \"active\",\n"
        "  \"createdAt\": \"serverTimestamp\",\n"
        "  \"updatedAt\": \"serverTimestamp\"\n"
        "}"
    ))
    story.append(P("Cita", "H2x"))
    story.append(code(
        "{\n"
        "  \"userId\": \"uid_123\",\n"
        "  \"vehicleId\": \"veh_abc\",\n"
        "  \"workshopId\": \"wrk_456\",\n"
        "  \"serviceType\": \"oil_change\",\n"
        "  \"status\": \"requested\",\n"
        "  \"preferredDate\": \"2026-06-15T09:00:00-04:00\",\n"
        "  \"notes\": \"Cambio de aceite y revision de filtro\",\n"
        "  \"contactSnapshot\": {\"name\": \"Rafael\", \"phone\": \"+1...\"},\n"
        "  \"createdAt\": \"serverTimestamp\",\n"
        "  \"updatedAt\": \"serverTimestamp\"\n"
        "}"
    ))
    story.append(P("Orden de mantenimiento", "H2x"))
    story.append(code(
        "{\n"
        "  \"appointmentId\": \"apt_789\",\n"
        "  \"userId\": \"uid_123\",\n"
        "  \"vehicleId\": \"veh_abc\",\n"
        "  \"workshopId\": \"wrk_456\",\n"
        "  \"status\": \"diagnosis\",\n"
        "  \"timeline\": [\n"
        "    {\"status\": \"received\", \"at\": \"serverTimestamp\", \"comment\": \"Vehiculo recibido\"},\n"
        "    {\"status\": \"diagnosis\", \"at\": \"serverTimestamp\", \"comment\": \"Diagnostico iniciado\"}\n"
        "  ],\n"
        "  \"estimatedReadyAt\": \"2026-06-15T17:00:00-04:00\",\n"
        "  \"updatedAt\": \"serverTimestamp\"\n"
        "}"
    ))

    story.append(P("6. Indices Firestore Recomendados", "H1x"))
    story.append(
        table(
            [
                ["Consulta", "Indice compuesto sugerido"],
                ["Mis vehiculos activos", "vehicles: ownerId ASC, status ASC, isPrimary DESC, updatedAt DESC"],
                ["Llenados por vehiculo", "vehicles/{id}/fuelFillUps: date DESC"],
                ["Collection group de llenados por usuario", "fuelFillUps: ownerId ASC, date DESC"],
                ["Historial precio combustible", "fuelPriceHistory: countryCode ASC, effectiveFrom DESC"],
                ["Talleres por tipo/estado", "workshops: type ASC, status ASC, verificationStatus ASC, ratingAvg DESC"],
                ["Talleres por servicio", "workshops: services ARRAY_CONTAINS, status ASC, ratingAvg DESC"],
                ["Gasolineras cercanas", "gasStations: geohash ASC, status ASC. Usar geohash bounds en cliente/function."],
                ["Mis citas", "appointments: userId ASC, status ASC, scheduledStartAt DESC"],
                ["Agenda del taller", "appointments: workshopId ASC, status ASC, scheduledStartAt ASC"],
                ["Mis ordenes activas", "workOrders: userId ASC, status ASC, updatedAt DESC"],
                ["Ordenes del taller", "workOrders: workshopId ASC, status ASC, updatedAt DESC"],
                ["Presupuestos pendientes", "estimates: userId ASC, status ASC, createdAt DESC"],
                ["Notificaciones no leidas", "notifications: userId ASC, readAt ASC, createdAt DESC"],
                ["Comunidad por categoria", "communityPosts: category ASC, status ASC, createdAt DESC"],
            ],
            [2.2 * inch, 4.35 * inch],
        )
    )

    story.append(P("7. Firebase Storage", "H1x"))
    story.append(code(
        "users/{uid}/profile/profile.jpg\n"
        "vehicles/{vehicleId}/photos/{fileId}.jpg\n"
        "vehicles/{vehicleId}/documents/{documentId}/{fileName}\n"
        "workshops/{workshopId}/logo.jpg\n"
        "workshops/{workshopId}/photos/{fileId}.jpg\n"
        "workOrders/{workOrderId}/evidence/{fileId}.jpg\n"
        "estimates/{estimateId}/attachments/{fileName}\n"
        "communityPosts/{postId}/{fileId}.jpg  # fase 2"
    ))
    story.append(P("Regla practica: guardar en Firestore el storagePath, contentType, size, uploadedBy y createdAt; no depender solo de URL publica.", "Bodyx"))

    story.append(P("8. Reglas de Seguridad Base", "H1x"))
    story.append(code(
        "rules_version = '2';\n"
        "service cloud.firestore {\n"
        "  match /databases/{database}/documents {\n"
        "    function signedIn() { return request.auth != null; }\n"
        "    function isSelf(uid) { return signedIn() && request.auth.uid == uid; }\n"
        "    function isAdmin() { return signedIn() && request.auth.token.role == 'admin'; }\n"
        "    function ownsVehicle(vehicleId) {\n"
        "      return signedIn() &&\n"
        "        get(/databases/$(database)/documents/vehicles/$(vehicleId)).data.ownerId == request.auth.uid;\n"
        "    }\n"
        "\n"
        "    match /users/{uid} {\n"
        "      allow read, update: if isSelf(uid) || isAdmin();\n"
        "      allow create: if isSelf(uid);\n"
        "    }\n"
        "    match /vehicles/{vehicleId} {\n"
        "      allow create: if signedIn() && request.resource.data.ownerId == request.auth.uid;\n"
        "      allow read, update, delete: if resource.data.ownerId == request.auth.uid || isAdmin();\n"
        "      match /{sub=**} {\n"
        "        allow read, write: if ownsVehicle(vehicleId) || isAdmin();\n"
        "      }\n"
        "    }\n"
        "    match /workshops/{workshopId} {\n"
        "      allow read: if true;\n"
        "      allow create, update: if isAdmin() || (signedIn() && request.resource.data.ownerUid == request.auth.uid);\n"
        "    }\n"
        "    match /appointments/{appointmentId} {\n"
        "      allow create: if signedIn() && request.resource.data.userId == request.auth.uid;\n"
        "      allow read, update: if isAdmin() || resource.data.userId == request.auth.uid;\n"
        "    }\n"
        "  }\n"
        "}"
    ))
    story.append(P("Nota: el acceso del taller a citas/ordenes debe validarse con ownerUid del workshop o custom claims. No dejar actualizacion publica de status.", "Bodyx"))

    story.append(P("9. Cloud Functions Recomendadas", "H1x"))
    story.append(
        table(
            [
                ["Funcion", "Disparador", "Responsabilidad"],
                ["onFuelFillUpWrite", "fuelFillUps create/update", "Recalcular monthlyStats, consumo promedio, gasto mensual y costo/km."],
                ["weeklyFuelPriceImport", "schedule semanal", "Cargar precio vigente e historico desde fuente oficial/admin."],
                ["onAppointmentStatusChange", "appointments update", "Enviar push/email y crear notification."],
                ["onWorkOrderUpdate", "workOrders update", "Notificar avances: diagnostico, esperando aprobacion, listo, entregado."],
                ["maintenanceReminderDaily", "schedule diario", "Crear notificaciones por fecha/kilometraje proximo."],
                ["expireOldIncidents", "schedule", "Ocultar reportes comunitarios vencidos."],
                ["aggregateReviews", "reviews write", "Actualizar ratingAvg y reviewsCount de talleres/gasolineras."],
            ],
            [1.65 * inch, 1.65 * inch, 3.25 * inch],
        )
    )

    story.append(P("10. Orden de Implementacion", "H1x"))
    story.append(
        table(
            [
                ["Fase", "Colecciones a activar", "Resultado"],
                ["1. Base", "users, appConfig, vehicleCatalog, serviceTypes", "Login, perfil, preferencias y catalogos."],
                ["2. Vehiculos", "vehicles + fuelFillUps + monthlyStats", "Garage, consumo, costo por km y gastos."],
                ["3. Combustible", "fuelPriceCurrent, fuelPriceHistory, gasStations, fuelAlerts", "Precios RD, historico, mapa y alertas."],
                ["4. Servicios", "workshops, appointments", "Directorio, perfil de taller y solicitud de cita."],
                ["5. Mantenimiento", "maintenanceRecords, workOrders, estimates", "Ruta de mantenimiento, presupuestos e historial."],
                ["6. Crecimiento", "communityPosts, incidentReports, reviews, businessClaims", "Comunidad, reportes, resenas y reclamo de negocios."],
            ],
            [1.3 * inch, 2.45 * inch, 2.8 * inch],
        )
    )

    story.append(P("11. Decisiones Importantes", "H1x"))
    story.append(
        bullets(
            [
                "No guardar pagos ni marketplace en la primera version; complica reglas, disputas y cumplimiento.",
                "Usar unidades internas consistentes. En RD muchas fuentes publican por galon; para calculos moviles conviene convertir a litros y mostrar ambas si hace falta.",
                "Mantener datos privados del vehiculo bajo reglas estrictas; talleres solo ven lo necesario cuando hay cita/orden.",
                "Guardar agregados mensuales para graficas rapidas, pero conservar fuelFillUps y expenses como fuente de verdad.",
                "Preparar comunidad como fase 2 con moderacion y reportes desde el inicio del modelo, aunque no se muestre todavia.",
            ]
        )
    )

    doc = BaseDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=0.72 * inch,
        leftMargin=0.72 * inch,
        topMargin=0.78 * inch,
        bottomMargin=0.72 * inch,
        title="Esquema Firebase AutomotrizRD",
        author="Codex",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])
    doc.build(story)
    return PDF_PATH


if __name__ == "__main__":
    print(build())
