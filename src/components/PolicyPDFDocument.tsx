import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

interface PolicyPDFDocumentProps {
  markdown: string;
  logo?: string | null;
}

// Very basic markdown to PDF (bold, italic, headings, lists)
function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let inList = false;
  lines.forEach((line, i) => {
    if (/^# (.*)/.test(line)) {
      nodes.push(<Text key={i} style={styles.h1}>{line.replace(/^# /, "")}</Text>);
    } else if (/^## (.*)/.test(line)) {
      nodes.push(<Text key={i} style={styles.h2}>{line.replace(/^## /, "")}</Text>);
    } else if (/^[-*] /.test(line)) {
      if (!inList) { inList = true; nodes.push(<View key={`ul-${i}`} style={styles.ul}/>); }
      nodes.push(<Text key={i} style={styles.li}>{line.replace(/^[-*] /, "• ")}</Text>);
    } else if (/^\d+\. /.test(line)) {
      if (!inList) { inList = true; nodes.push(<View key={`ol-${i}`} style={styles.ol}/>); }
      nodes.push(<Text key={i} style={styles.li}>{line}</Text>);
    } else if (/^\s*$/.test(line)) {
      inList = false;
      nodes.push(<Text key={i} style={styles.spacer}> </Text>);
    } else {
      // Bold/italic (very basic)
      let content = line.replace(/\*\*(.*?)\*\*/g, (_, t) => t.toUpperCase()); // bold
      content = content.replace(/\*(.*?)\*/g, (_, t) => t); // italic
      nodes.push(<Text key={i} style={styles.p}>{content}</Text>);
    }
  });
  return nodes;
}

const PolicyPDFDocument: React.FC<PolicyPDFDocumentProps> = ({ markdown, logo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {logo && (
        <View style={styles.logoContainer}>
          <Image src={logo} style={styles.logo} />
        </View>
      )}
      <View style={styles.content}>{parseMarkdown(markdown)}</View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica" },
  logoContainer: { alignItems: "center", marginBottom: 24 },
  logo: { width: 120, height: 60, objectFit: "contain" },
  content: { flexDirection: "column", gap: 8 },
  h1: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  h2: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  p: { fontSize: 12, marginBottom: 4 },
  li: { fontSize: 12, marginLeft: 12, marginBottom: 2 },
  ul: { marginBottom: 4 },
  ol: { marginBottom: 4 },
  spacer: { marginBottom: 8 },
});

export default PolicyPDFDocument;
