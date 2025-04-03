import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { collection, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Producto = {
  id: string;
  productName?: string;
  brand?: string;
  barcode?: string;
  category?: string;
  stock?: number;
  purchasePrice?: number;
  salePrice?: number;
  expirationDate?: string;
};

export default function InventoryScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [incompletos, setIncompletos] = useState<Producto[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const data: Producto[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const completos = data.filter((p) =>
        p.productName &&
        p.brand &&
        p.barcode &&
        p.category &&
        typeof p.stock === 'number' &&
        typeof p.purchasePrice === 'number' &&
        typeof p.salePrice === 'number' &&
        p.expirationDate
      );

      const faltantes = data.filter(p => !completos.includes(p));

      setProductos(completos);
      setIncompletos(faltantes);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'productos', id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const fechaFormateada = item.expirationDate
      ? new Date(item.expirationDate).toLocaleDateString()
      : 'N/D';

    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleDelete(item.id)}
      >
        <Text style={styles.name}>📦 {item.productName}</Text>
        <Text>🏷️ Marca: {item.brand}</Text>
        <Text>🔢 Código: {item.barcode}</Text>
        <Text>📂 Categoría: {item.category}</Text>
        <Text>📦 Stock: {item.stock}</Text>
        <Text>💰 Compra: ${item.purchasePrice?.toFixed(2)}</Text>
        <Text>💸 Venta: ${item.salePrice?.toFixed(2)}</Text>
        <Text>📅 Caducidad: {fechaFormateada}</Text>
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Inventario</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No hay productos completos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
