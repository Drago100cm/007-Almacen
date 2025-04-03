import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { collection, doc, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [accion, setAccion] = useState<'agregar' | 'eliminar' | null>(null);

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
            Alert.alert('Producto eliminado', 'El producto ha sido eliminado correctamente.');
          },
        },
      ]
    );
  };

  const confirmarEliminarTodoElStock = (producto: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar completamente "${producto.productName}" del inventario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'productos', producto.id));
            Alert.alert('Producto eliminado', 'El producto ha sido eliminado del inventario.');
          },
        },
      ]
    );
  };

  const showOptions = (producto: Producto) => {
    Alert.alert(
      'Acciones',
      '¿Qué deseas hacer con este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar stock',
          onPress: () => {
            setAccion('agregar');
            setSelectedProduct(producto);
            setModalVisible(true);
          },
        },
        {
          text: 'Eliminar stock',
          onPress: () => {
            setAccion('eliminar');
            setSelectedProduct(producto);
            setModalVisible(true);
          },
        },
        {
          text: 'Eliminar producto',
          style: 'destructive',
          onPress: () => handleDelete(producto.id),
        },
      ]
    );
  };

  const handleActualizarStock = async () => {
    if (!selectedProduct || typeof selectedProduct.stock !== 'number') return;

    const cantidadNum = parseInt(cantidad.trim(), 10);

    if (
      isNaN(cantidadNum) ||
      cantidad.trim() === '' ||
      !/^\d+$/.test(cantidad.trim()) ||
      cantidadNum <= 0
    ) {
      Alert.alert('Cantidad inválida', 'Ingresa un número entero positivo sin espacios ni símbolos.');
      return;
    }

    let nuevoStock = selectedProduct.stock;

    if (accion === 'eliminar') {
      const maxEliminar = selectedProduct.stock - 1;
      if (cantidadNum > maxEliminar) {
        Alert.alert('Error', `Solo puedes eliminar hasta ${maxEliminar} unidades.`);
        return;
      }
      nuevoStock = selectedProduct.stock - cantidadNum;
    }

    if (accion === 'agregar') {
      nuevoStock = selectedProduct.stock + cantidadNum;
    }

    await updateDoc(doc(db, 'productos', selectedProduct.id), {
      stock: nuevoStock,
    });

    Alert.alert('Stock actualizado', `Stock actualizado correctamente (${nuevoStock} unidades).`);
    setModalVisible(false);
    setCantidad('');
    setSelectedProduct(null);
    setAccion(null);
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const fechaFormateada = item.expirationDate
      ? new Date(item.expirationDate).toLocaleDateString()
      : 'N/D';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => showOptions(item)}
        onLongPress={() => confirmarEliminarTodoElStock(item)}
      >
        <Text style={styles.name}>📦 {item.productName}</Text>
        <Text>🏷️ Marca: {item.brand}</Text>
        <Text>🔢 Código: {item.barcode}</Text>
        <Text>📂 Categoría: {item.category}</Text>
        <Text style={item.stock === 0 ? styles.stockZero : undefined}>
          📦 Stock: {item.stock}
        </Text>
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

      {/* Modal para agregar/eliminar stock */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {accion === 'agregar' ? 'Agregar stock' : 'Eliminar stock'}
            </Text>
            <Text>Stock actual: {selectedProduct?.stock}</Text>
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '');
                setCantidad(filtered);
              }}
              maxLength={5}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => {
                setModalVisible(false);
                setCantidad('');
                setAccion(null);
              }} />
              <Button
                title={accion === 'agregar' ? 'Agregar' : 'Eliminar'}
                onPress={handleActualizarStock}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  stockZero: {
    color: 'red',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
