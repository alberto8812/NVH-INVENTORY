import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import '@/shared/pdf/fonts';
import type { EmployeeAssignmentReportData } from '@/app/(dashboard)/employees/actions';

const STATUS_LABELS: Record<string, string> = {
  GOOD: 'Bueno',
  REGULAR: 'Regular',
  BAD: 'Malo',
  DAMAGED: 'Dañado',
  RETIRED: 'Dado de baja',
};

const NAVY = '#00365f';
const TEAL = '#17af95';
const NAVY_LIGHT = '#e8f0f7';
const TEAL_LIGHT = '#e8f8f5';
const INK = '#111827';
const INK_SECONDARY = '#4b5563';
const INK_MUTED = '#9ca3af';
const BORDER = '#e5e7eb';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Poppins',
    fontSize: 9.5,
    color: INK,
    backgroundColor: WHITE,
  },

  // ── Header band ──────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: NAVY,
    paddingTop: 28,
    paddingBottom: 22,
    paddingLeft: 36,
    paddingRight: 36,
  },
  headerOrg: {
    fontSize: 7.5,
    color: TEAL,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerMetaChip: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 7,
    paddingRight: 7,
  },
  headerMetaText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.75)',
  },

  // ── Teal accent line ──────────────────────────────────────────────────────
  accentLine: {
    height: 3,
    backgroundColor: TEAL,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingLeft: 36,
    paddingRight: 36,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccentBar: {
    width: 3,
    height: 13,
    backgroundColor: TEAL,
    marginRight: 7,
    borderRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
    color: NAVY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Employee data grid ────────────────────────────────────────────────────
  dataGrid: {
    backgroundColor: '#f9fafb',
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dataRowLast: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dataLabel: {
    width: 100,
    fontSize: 8.5,
    color: INK_MUTED,
    fontFamily: 'Poppins',
  },
  dataValue: {
    flex: 1,
    fontSize: 8.5,
    color: INK,
    fontFamily: 'Poppins-Bold',
  },

  // ── Asset table ───────────────────────────────────────────────────────────
  tableContainer: {
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableHeadCell: {
    fontSize: 7.5,
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableRowEven: {
    backgroundColor: TEAL_LIGHT,
  },
  tableRowOdd: {
    backgroundColor: WHITE,
  },
  tableRowBorder: {
    borderBottom: `0.5px solid ${BORDER}`,
  },
  tableCell: {
    fontSize: 8.5,
    color: INK_SECONDARY,
  },
  tableCellCode: {
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
    color: NAVY,
  },

  // Column widths
  cCode: { width: '22%' },
  cDesc: { width: '30%' },
  cSerial: { width: '20%' },
  cStatus: { width: '14%' },
  cDate: { width: '14%' },

  // Status badge
  statusBadge: {
    backgroundColor: NAVY_LIGHT,
    borderRadius: 2,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 4,
    paddingRight: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 7.5,
    color: NAVY,
    fontFamily: 'Poppins-Bold',
  },

  empty: { color: INK_MUTED, fontStyle: 'italic', fontSize: 9 },

  // ── Declaration ───────────────────────────────────────────────────────────
  declarationBox: {
    backgroundColor: '#fffbeb',
    border: `1px solid #fde68a`,
    borderLeft: `3px solid #f59e0b`,
    borderRadius: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  declarationText: {
    fontSize: 8.5,
    color: '#78350f',
    lineHeight: 1.55,
  },
  clauseItem: { marginBottom: 9 },
  clauseItemLast: { marginBottom: 0 },
  clauseTitle: {
    fontSize: 8.5,
    fontFamily: 'Poppins-Bold',
    color: '#78350f',
    marginBottom: 3,
  },
  clauseParagraph: {
    fontSize: 8.5,
    color: '#78350f',
    lineHeight: 1.55,
    marginBottom: 3,
  },
  clauseParagraphLast: {
    fontSize: 8.5,
    color: '#78350f',
    lineHeight: 1.55,
    marginBottom: 0,
  },

  // ── Signatures ────────────────────────────────────────────────────────────
  signRow: {
    flexDirection: 'row',
    marginTop: 32,
    justifyContent: 'space-between',
    gap: 24,
  },
  signBox: {
    flex: 1,
    borderTop: `2px solid ${NAVY}`,
    paddingTop: 8,
  },
  signName: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: INK,
    marginBottom: 3,
  },
  signMeta: {
    fontSize: 8,
    color: INK_MUTED,
    marginBottom: 2,
  },
  signField: {
    fontSize: 8,
    color: INK_SECONDARY,
    borderBottom: `0.5px solid ${BORDER}`,
    paddingBottom: 2,
    marginBottom: 4,
    marginTop: 8,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${BORDER}`,
    marginTop: 24,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: INK_MUTED,
  },
  footerBrand: {
    fontSize: 7.5,
    color: TEAL,
    fontFamily: 'Poppins-Bold',
  },
});

interface EmployeeAssignmentPDFProps {
  data: EmployeeAssignmentReportData;
}

const CLAUSES: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Constancia de entrega',
    paragraphs: [
      'Mediante la presente acta se deja constancia de la entrega de los equipos, herramientas, accesorios, dispositivos, licencias, documentos y demás bienes de propiedad de NOVAHOLD S.A.S., necesarios para el desarrollo de las funciones laborales asignadas.',
      'El trabajador declara haber recibido los bienes anteriormente relacionados en adecuado estado de funcionamiento, salvo las observaciones consignadas expresamente en este documento.',
    ],
  },
  {
    title: '2. Destinación exclusiva para actividades laborales',
    paragraphs: [
      'El trabajador se compromete a utilizar los bienes entregados exclusivamente para el desempeño de las funciones propias de su cargo y demás actividades autorizadas por NOVAHOLD S.A.S., actuando con la debida diligencia, cuidado y responsabilidad.',
      'Queda prohibido destinar los bienes a actividades ilícitas, personales no autorizadas o cualquier uso que pueda afectar su integridad, funcionamiento, seguridad o disponibilidad.',
    ],
  },
  {
    title: '3. Obligación de custodia y conservación',
    paragraphs: [
      'El trabajador será responsable de la adecuada custodia, conservación, protección y uso de los bienes entregados durante el tiempo en que permanezcan bajo su tenencia.',
      'Asimismo, se compromete a:',
      'a) Mantener los equipos en buen estado de funcionamiento y limpieza.',
      'b) Adoptar las medidas razonables de seguridad física y digital para evitar pérdidas, daños, alteraciones, accesos no autorizados o usos indebidos.',
      'c) Informar de manera inmediata a NOVAHOLD S.A.S. cualquier daño, falla, pérdida, hurto, incidente de seguridad o situación que pueda afectar los bienes entregados.',
      'd) No realizar modificaciones, reparaciones, instalaciones de software o cambios de configuración sin autorización previa de NOVAHOLD S.A.S. o del área responsable.',
    ],
  },
  {
    title: '4. Responsabilidad por pérdida, daño o uso indebido',
    paragraphs: [
      'En caso de pérdida, daño o deterioro atribuible a dolo, culpa grave o incumplimiento de las instrucciones impartidas por NOVAHOLD S.A.S., el trabajador podrá ser sujeto de las acciones disciplinarias, laborales, civiles o legales que correspondan, de conformidad con la legislación colombiana vigente.',
      'En todo caso, cualquier deducción, compensación o descuento sobre salarios o prestaciones sociales requerirá la autorización previa, expresa y escrita del trabajador o la correspondiente decisión judicial, de conformidad con la normatividad laboral colombiana.',
    ],
  },
  {
    title: '5. Seguridad de la información y confidencialidad',
    paragraphs: [
      'Cuando los bienes entregados permitan el acceso a información corporativa, bases de datos, plataformas tecnológicas, correos electrónicos, archivos físicos o digitales y demás activos de información de NOVAHOLD S.A.S., el trabajador se obliga a:',
      'a) Mantener la confidencialidad de la información a la que tenga acceso.',
      'b) No divulgar, copiar, transferir o reproducir información sin autorización.',
      'c) Proteger credenciales, contraseñas y mecanismos de autenticación.',
      'd) Cumplir las políticas de seguridad de la información, protección de datos personales y ciberseguridad establecidas por NOVAHOLD S.A.S.',
      'Estas obligaciones permanecerán vigentes incluso después de la terminación de la relación laboral.',
    ],
  },
  {
    title: '6. Inspección y verificación',
    paragraphs: [
      'NOVAHOLD S.A.S. podrá verificar en cualquier momento el estado, ubicación y uso adecuado de los bienes entregados, así como requerir inventarios, reportes o evidencias de su conservación, respetando los derechos fundamentales del trabajador y la legislación aplicable.',
    ],
  },
  {
    title: '7. Devolución de bienes',
    paragraphs: [
      'El trabajador se obliga a devolver la totalidad de los bienes entregados en los siguientes eventos:',
      'a) Terminación del contrato de trabajo por cualquier causa.',
      'b) Cambio de cargo cuando así lo requiera NOVAHOLD S.A.S.',
      'c) Solicitud expresa de devolución por parte de la compañía.',
      'La devolución deberá realizarse junto con sus accesorios, claves, dispositivos de seguridad, cargadores, licencias, documentos y demás elementos asociados.',
    ],
  },
  {
    title: '8. Estado de devolución',
    paragraphs: [
      'Los bienes deberán ser devueltos en condiciones normales de uso, considerando el desgaste natural derivado de su utilización adecuada. NOVAHOLD S.A.S. verificará el estado de los bienes al momento de su entrega.',
    ],
  },
  {
    title: '9. Aceptación',
    paragraphs: [
      'El trabajador manifiesta haber recibido los bienes descritos en esta acta y declara conocer y aceptar las obligaciones aquí contenidas, así como las políticas internas de NOVAHOLD S.A.S. relacionadas con el uso de equipos, herramientas, activos tecnológicos, seguridad de la información y protección de datos.',
      'Para constancia se firma en dos ejemplares del mismo tenor.',
    ],
  },
];

export function EmployeeAssignmentPDF({ data }: EmployeeAssignmentPDFProps) {
  const { employee, assignments, generatedAt } = data;

  const generatedDate = new Date(generatedAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header band ─────────────────────────────────────────────── */}
        <View style={styles.headerBand}>
          <Text style={styles.headerOrg}>Novahold · Gestión de Activos</Text>
          <Text style={styles.headerTitle}>Acta de Asignación de Equipos</Text>
          <View style={styles.headerMeta}>
            <View style={styles.headerMetaChip}>
              <Text style={styles.headerMetaText}>{employee.fullName}</Text>
            </View>
            <View style={styles.headerMetaChip}>
              <Text style={styles.headerMetaText}>Generado {generatedDate}</Text>
            </View>
            <View style={styles.headerMetaChip}>
              <Text style={styles.headerMetaText}>
                {assignments.length} equipo{assignments.length !== 1 ? 's' : ''} asignado{assignments.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Teal accent ─────────────────────────────────────────────── */}
        <View style={styles.accentLine} />

        {/* ── Body ────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Datos del empleado */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Datos del empleado</Text>
            </View>
            <View style={styles.dataGrid}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Nombre</Text>
                <Text style={styles.dataValue}>{employee.fullName}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Cargo</Text>
                <Text style={styles.dataValue}>{employee.position ?? '—'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Email</Text>
                <Text style={styles.dataValue}>{employee.email}</Text>
              </View>
              {employee.phone && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Teléfono</Text>
                  <Text style={styles.dataValue}>{employee.phone}</Text>
                </View>
              )}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Departamento</Text>
                <Text style={styles.dataValue}>{employee.departmentName ?? '—'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Sede</Text>
                <Text style={styles.dataValue}>{employee.locationName ?? '—'}</Text>
              </View>
              <View style={styles.dataRowLast}>
                <Text style={styles.dataLabel}>Ciudad</Text>
                <Text style={styles.dataValue}>{employee.cityName ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* Equipos asignados */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>
                Equipos asignados ({assignments.length})
              </Text>
            </View>

            {assignments.length === 0 ? (
              <Text style={styles.empty}>Sin equipos asignados</Text>
            ) : (
              <View style={styles.tableContainer}>
                <View style={styles.tableHead}>
                  <Text style={[styles.tableHeadCell, styles.cCode]}>Código</Text>
                  <Text style={[styles.tableHeadCell, styles.cDesc]}>Marca / Modelo</Text>
                  <Text style={[styles.tableHeadCell, styles.cSerial]}>Serial</Text>
                  <Text style={[styles.tableHeadCell, styles.cStatus]}>Estado</Text>
                  <Text style={[styles.tableHeadCell, styles.cDate]}>Asignado</Text>
                </View>
                {assignments.map((a, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      i % 2 === 0 ? styles.tableRowOdd : styles.tableRowEven,
                      i < assignments.length - 1 ? styles.tableRowBorder : {},
                    ]}
                  >
                    <Text style={[styles.tableCellCode, styles.cCode]}>
                      {a.assetCode}
                    </Text>
                    <Text style={[styles.tableCell, styles.cDesc]}>
                      {[a.brand, a.model].filter(Boolean).join(' ') || '—'}
                    </Text>
                    <Text style={[styles.tableCell, styles.cSerial]}>
                      {a.serialNumber ?? '—'}
                    </Text>
                    <View style={styles.cStatus}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {STATUS_LABELS[a.generalStatus] ?? a.generalStatus}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCell, styles.cDate]}>
                      {new Date(a.assignedAt).toLocaleDateString('es-CO')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Declaración de responsabilidad */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Declaración de responsabilidad</Text>
            </View>
            <View style={styles.declarationBox}>
              {CLAUSES.map((clause, ci) => (
                <View
                  key={ci}
                  wrap={false}
                  style={ci < CLAUSES.length - 1 ? styles.clauseItem : styles.clauseItemLast}
                >
                  <Text style={styles.clauseTitle}>{clause.title}</Text>
                  {clause.paragraphs.map((p, pi) => (
                    <Text
                      key={pi}
                      style={
                        pi < clause.paragraphs.length - 1
                          ? styles.clauseParagraph
                          : styles.clauseParagraphLast
                      }
                    >
                      {p}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Firmas */}
          <View style={styles.signRow}>
            <View style={styles.signBox}>
              <Text style={styles.signName}>{employee.fullName}</Text>
              <Text style={styles.signMeta}>Empleado</Text>
              <Text style={styles.signField}>C.C. ___________________________</Text>
              <Text style={styles.signField}>Firma ___________________________</Text>
              <Text style={styles.signField}>Fecha ___________________________</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signName}>Representante Novahold</Text>
              <Text style={styles.signMeta}>Área de Tecnología</Text>
              <Text style={styles.signField}>Nombre ___________________________</Text>
              <Text style={styles.signField}>Firma ___________________________</Text>
              <Text style={styles.signField}>Fecha ___________________________</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Documento generado el {generatedDate} · Sistema de Gestión de Inventario
            </Text>
            <Text style={styles.footerBrand}>NOVAHOLD</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
