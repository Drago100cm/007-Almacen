import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LottieView from 'lottie-react-native';

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
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>👋 Bienvenido</Text>
        <Text style={styles.subheader}>Gestión de Inventario Moderna</Text>
      </View>

      {/* Animación + datos */}
      <View style={styles.lottieBox}>
        <LottieView
          source={require('../assets/animation.json')}
          autoPlay
          loop
          style={{ width: 220, height: 220 }}
        />
        <Text style={styles.infoText}>📦 Productos registrados: {productCount}</Text>
        <Text style={styles.infoText}>📁 Categorías únicas: {categoryCount}</Text>
      </View>

      {/* Tarjetas informativas */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardNumber}>{productCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Categorías</Text>
          <Text style={styles.cardNumber}>{categoryCount}</Text>
        </View>
      </View>

      {/* Barra inferior */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Registrar Producto')}
        >
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Buscar Producto')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Buscar</Text>
        </TouchableOpacity>

        {/*
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Inventario')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Inventario</Text>
        </TouchableOpacity>*/}
      </View>
    </SafeAreaView>
    
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6fc',
    justifyContent: 'space-between', // Distribuye el header y navbar con espacio entre ellos
  },
  headerContainer: {
    paddingTop: 40, // Espacio para evitar la barra de estado
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2c3e50', // Título principal oscuro
  },
  subheader: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  lottieBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    marginTop: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    justifyContent: 'space-between', // Distribuye las tarjetas uniformemente
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    elevation: 4, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Espaciado entre íconos de navegación
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#dcdde1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 15,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007bff',
    marginTop: 3,
  },
});
