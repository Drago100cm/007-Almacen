import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import BarcodeScanner from '../components/BarcodeScanner';

type Producto = {
  productName?: string;
  brand?: string;
  barcode?: string;
  category?: string;
  stock?: number;
  purchasePrice?: number;
  salePrice?: number;
  expirationDate?: string;
};

export default function SearchProductScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Producto[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const searchProduct = async (term: string) => {
    setError('');
    setNotFound(false);
    setResults([]);

    const cleanTerm = term.trim().toLowerCase();
    if (cleanTerm.length < 2) {
      setError('Escribe al menos 2 caracteres');
      return;
    }

    const snapshot = await getDocs(collection(db, 'productos'));
    const productos = snapshot.docs.map(doc => doc.data() as Producto);

    const matches = productos.filter(p =>
      p.productName?.toLowerCase().includes(cleanTerm) ||
      p.barcode?.startsWith(cleanTerm)
    );

    if (matches.length > 0) {
      setResults(matches);
    } else {
      setNotFound(true);
    }
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const fecha = item.expirationDate
      ? new Date(item.expirationDate).toLocaleDateString()
      : 'N/D';

    return (
      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>{item.productName}</Text>
        <Text>🏷️ Marca: {item.brand}</Text>
        <Text>🔢 Código: {item.barcode}</Text>
        <Text>📂 Categoría: {item.category}</Text>
        <Text>📦 Stock: {item.stock}</Text>
        <Text>💰 Compra: ${item.purchasePrice?.toFixed(2)}</Text>
        <Text>💸 Venta: ${item.salePrice?.toFixed(2)}</Text>
        <Text>📅 Caducidad: {fecha}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>🔎 Buscar Producto</Text>

      <Text style={styles.label}>Buscar por nombre o código</Text>
      <View style={styles.row}>
        <TextInput
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setError('');
            setNotFound(false);
            setResults([]);
          }}
          placeholder="Ej. 7501 o 'pan'"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setScannerVisible(true)}
        >
          <Text style={styles.scanText}>📷</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => searchProduct(searchTerm)}
        disabled={!searchTerm}
      >
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      {results.length > 0 ? (
        <>
          <Text style={styles.subTitle}>Resultados: {results.length}</Text>
          <FlatList
            data={results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      ) : notFound ? (
        <Text style={styles.notFound}>❌ No se encontró ningún producto</Text>
      ) : null}

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={(data) => {
          setSearchTerm(data);
          searchProduct(data);
          setScannerVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  scanButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  scanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#e7fbe7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  notFound: {
    color: 'red',
    marginTop: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'crimson',
    fontSize: 13,
    marginVertical: 5,
  },
});
