import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BarcodeScanner from '../components/BarcodeScanner';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function RegisterProductScreen() {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ✅ Sanea el texto: sin caracteres especiales y máx. 5 espacios
  const sanitizeText = (text: string) => {
    const sinEspeciales = text.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '');
    const palabras = sinEspeciales.split(' ').filter(Boolean);
    return palabras.slice(0, 6).join(' ');
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!productName) newErrors.productName = 'El nombre es obligatorio';
    if (!brand) newErrors.brand = 'La marca es obligatoria';
    if (!stock || isNaN(Number(stock)) || Number(stock) <= 0) newErrors.stock = 'Stock inválido';
    if (!category) newErrors.category = 'Selecciona una categoría';
    if (!purchasePrice || isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0)
      newErrors.purchasePrice = 'Precio de compra inválido';
    if (!salePrice || isNaN(Number(salePrice)) || Number(salePrice) <= 0)
      newErrors.salePrice = 'Precio de venta inválido';

    const compra = parseFloat(purchasePrice);
    const venta = parseFloat(salePrice);
    if (compra && venta && venta <= compra)
      newErrors.salePrice = 'El precio de venta debe ser mayor al de compra';

    if (!barcode) newErrors.barcode = 'Escanea un código de barras';

    const hoy = new Date();
    if (expirationDate <= hoy) newErrors.expirationDate = 'La fecha debe ser futura';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      await addDoc(collection(db, 'productos'), {
        productName,
        brand,
        stock: parseInt(stock),
        category,
        purchasePrice: compra,
        salePrice: venta,
        expirationDate: expirationDate.toISOString(),
        barcode,
      });

      // Limpieza
      setProductName('');
      setBrand('');
      setStock('');
      setCategory('');
      setPurchasePrice('');
      setSalePrice('');
      setBarcode('');
      setExpirationDate(new Date());
      setErrors({});
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Nombre del producto</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={(text) => {
            setProductName(sanitizeText(text));
            setErrors((prev) => ({ ...prev, productName: '' }));
          }}
        />
        {errors.productName && <Text style={styles.errorText}>{errors.productName}</Text>}

        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          value={brand}
          onChangeText={(text) => {
            setBrand(sanitizeText(text));
            setErrors((prev) => ({ ...prev, brand: '' }));
          }}
        />
        {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={(text) => {
            setStock(text.replace(/[^0-9]/g, ''));
            setErrors((prev) => ({ ...prev, stock: '' }));
          }}
          keyboardType="numeric"
        />
        {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => {
              setCategory(value);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
          >
            <Picker.Item label="Seleccionar Categoría" value="" />
            <Picker.Item label="Tecnología" value="Tecnología" />
            <Picker.Item label="Ropa y Moda" value="Ropa y Moda" />
            <Picker.Item label="Hogar y Muebles" value="Hogar y Muebles" />
            <Picker.Item label="Alimentos y Bebidas" value="Alimentos y Bebidas" />
            <Picker.Item label="Salud" value="Salud" />
            <Picker.Item label="Deportes" value="Deportes" />
            <Picker.Item label="Juguetes y Juegos" value="Juguetes y Juegos" />
            <Picker.Item label="Automotriz" value="Automotriz" />
            <Picker.Item label="Libros" value="Libros" />
            <Picker.Item label="Hobbies y Arte" value="Hobbies y Arte" />
            <Picker.Item label="Ciencia" value="Ciencia" />
          </Picker>
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        <Text style={styles.label}>Precio de compra</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={(text) => {
            setPurchasePrice(text.replace(/[^0-9.]/g, ''));
            setErrors((prev) => ({ ...prev, purchasePrice: '' }));
          }}
          keyboardType="decimal-pad"
        />
        {errors.purchasePrice && <Text style={styles.errorText}>{errors.purchasePrice}</Text>}

        <Text style={styles.label}>Precio de venta</Text>
        <TextInput
          style={styles.input}
          value={salePrice}
          onChangeText={(text) => {
            setSalePrice(text.replace(/[^0-9.]/g, ''));
            setErrors((prev) => ({ ...prev, salePrice: '' }));
          }}
          keyboardType="decimal-pad"
        />
        {errors.salePrice && <Text style={styles.errorText}>{errors.salePrice}</Text>}

        <Text style={styles.label}>Fecha de caducidad</Text>
        <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={expirationDate}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              if (selectedDate) {
                setExpirationDate(selectedDate);
                setErrors((prev) => ({ ...prev, expirationDate: '' }));
              }
              setShowDatePicker(false);
            }}
            minimumDate={new Date()} // ✅ no permite fechas anteriores
          />
        )}
        {errors.expirationDate && <Text style={styles.errorText}>{errors.expirationDate}</Text>}

        <Text style={styles.label}>Código de barras</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          editable={false}
        />
        {errors.barcode && <Text style={styles.errorText}>{errors.barcode}</Text>}

        <Button title="Escanear Código de Barras" onPress={() => setScannerVisible(true)} />
        <Button title="Guardar Producto" onPress={handleSave} color="#28a745" />
      </View>

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={(data) => {
          setBarcode(data);
          setErrors((prev) => ({ ...prev, barcode: '' }));
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  form: {
    gap: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
});
