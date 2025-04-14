import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
});

interface RFIPdfDocumentProps {
  rfi: {
    codigo: string;
    dataSubmissao: string;
    projetoNome: string;
    assunto: string;
    descricao: string;
    responsavel: string;
    prazoResposta: string;
    estado: string;
  };
}

export default function RFIPdfDocument({ rfi }: RFIPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RFI - {rfi.codigo}</Text>
          <Text style={styles.subtitle}>{rfi.projetoNome}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Data de Submissão:</Text>
            <Text style={styles.tableCell}>{new Date(rfi.dataSubmissao).toLocaleDateString()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Estado:</Text>
            <Text style={styles.tableCell}>{rfi.estado}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Responsável:</Text>
            <Text style={styles.tableCell}>{rfi.responsavel}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Prazo de Resposta:</Text>
            <Text style={styles.tableCell}>{new Date(rfi.prazoResposta).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assunto</Text>
          <Text style={styles.text}>{rfi.assunto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição da Dúvida</Text>
          <Text style={styles.text}>{rfi.descricao}</Text>
        </View>
      </Page>
    </Document>
  );
}