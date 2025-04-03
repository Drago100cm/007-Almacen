import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const productos = snapshot.docs.map((doc) => doc.data());
      setProductCount(productos.length);

      const categorias = new Set(productos.map((p: any) => p.category || 'Sin categoría'));
      setCategoryCount(categorias.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>👋 Bienvenido</Text>
      <Text style={styles.subheader}>Gestión de Inventario</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos registrados</Text>
          <Text style={styles.cardNumber}>{productCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Categorías distintas</Text>
          <Text style={styles.cardNumber}>{categoryCount}</Text>
        </View>
      </View>

      <Text style={styles.quickAccessTitle}>🚀 ¿Qué deseas hacer hoy?</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Registrar Producto')}
        >
          <Text style={styles.buttonText}>Registrar Producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Buscar Producto')}
        >
          <Text style={styles.buttonText}>Buscar Producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Inventario')}
        >
          <Text style={styles.buttonText}>Ver Inventario</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f8fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonsContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
