import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Test } from '../contexts/DataContext';
import type { NonConformity } from '../contexts/DataContext';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  observation: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
});

export async function downloadMultipleFiles(files: { url: string; name: string }[]) {
  const zip = new JSZip();

  // Add each file to the ZIP
  for (const file of files) {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    } catch (error) {
      console.error(`Error downloading file ${file.name}:`, error);
    }
  }

  // Generate and download the ZIP file
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'documentos.zip');
}

export async function generateTestReport(tests: Test[], observation?: string) {
  const TestReport = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Ensaios</Text>
          <Text style={styles.subtitle}>Data: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.text}>Total de Ensaios: {tests.length}</Text>
          <Text style={styles.text}>
            Aprovados: {tests.filter(t => t.aprovado).length}
          </Text>
          <Text style={styles.text}>
            Reprovados: {tests.filter(t => !t.aprovado).length}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de Ensaios</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Tipo</Text>
            <Text style={styles.tableCell}>Data</Text>
            <Text style={styles.tableCell}>Zona</Text>
            <Text style={styles.tableCell}>Resultado</Text>
            <Text style={styles.tableCell}>Status</Text>
          </View>
          {tests.map((test, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{test.tipo}</Text>
              <Text style={styles.tableCell}>
                {new Date(test.data).toLocaleDateString()}
              </Text>
              <Text style={styles.tableCell}>{test.zona}</Text>
              <Text style={styles.tableCell}>{test.resultado}</Text>
              <Text style={styles.tableCell}>
                {test.aprovado ? 'Aprovado' : 'Reprovado'}
              </Text>
            </View>
          ))}
        </View>

        {observation && (
          <View style={styles.observation}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.text}>{observation}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Relatório gerado automaticamente em {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<TestReport />).toBlob();
  saveAs(blob, 'relatorio-ensaios.pdf');
}

export async function generateNCReport(ncs: NonConformity[], observation?: string) {
  const NCReport = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Não Conformidades</Text>
          <Text style={styles.subtitle}>Data: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.text}>Total de NCs: {ncs.length}</Text>
          <Text style={styles.text}>
            Em Aberto: {ncs.filter(nc => nc.estado === 'Aberta').length}
          </Text>
          <Text style={styles.text}>
            Resolvidas: {ncs.filter(nc => nc.estado === 'Resolvida').length}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de Não Conformidades</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Código</Text>
            <Text style={styles.tableCell}>Tipo</Text>
            <Text style={styles.tableCell}>Data</Text>
            <Text style={styles.tableCell}>Estado</Text>
            <Text style={styles.tableCell}>Responsável</Text>
          </View>
          {ncs.map((nc, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{nc.codigo}</Text>
              <Text style={styles.tableCell}>{nc.tipo}</Text>
              <Text style={styles.tableCell}>
                {new Date(nc.dataRegisto).toLocaleDateString()}
              </Text>
              <Text style={styles.tableCell}>{nc.estado}</Text>
              <Text style={styles.tableCell}>{nc.responsavel}</Text>
            </View>
          ))}
        </View>

        {observation && (
          <View style={styles.observation}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.text}>{observation}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Relatório gerado automaticamente em {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<NCReport />).toBlob();
  saveAs(blob, 'relatorio-ncs.pdf');
}

export async function generateChecklistReport(checklists: any[], observation?: string) {
  const ChecklistReport = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Checklists</Text>
          <Text style={styles.subtitle}>Data: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.text}>Total de Checklists: {checklists.length}</Text>
          <Text style={styles.text}>
            Validados: {checklists.filter(c => c.estado === 'Validado').length}
          </Text>
          <Text style={styles.text}>
            Pendentes: {checklists.filter(c => c.estado === 'Pendente').length}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de Checklists</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Código</Text>
            <Text style={styles.tableCell}>Atividade</Text>
            <Text style={styles.tableCell}>Data</Text>
            <Text style={styles.tableCell}>Estado</Text>
            <Text style={styles.tableCell}>Responsável</Text>
          </View>
          {checklists.map((checklist, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{checklist.codigo}</Text>
              <Text style={styles.tableCell}>{checklist.nomeAtividade}</Text>
              <Text style={styles.tableCell}>
                {new Date(checklist.dataRegisto).toLocaleDateString()}
              </Text>
              <Text style={styles.tableCell}>{checklist.estado}</Text>
              <Text style={styles.tableCell}>{checklist.responsavel}</Text>
            </View>
          ))}
        </View>

        {observation && (
          <View style={styles.observation}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.text}>{observation}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Relatório gerado automaticamente em {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<ChecklistReport />).toBlob();
  saveAs(blob, 'relatorio-checklists.pdf');
}