import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import BarcodeScanner from '../components/BarcodeScanner';
import { useNavigation } from '@react-navigation/native';

export default function RegisterProductScreen() {
  const navigation = useNavigation();
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [compraDate, setCompraDate] = useState(new Date());
  const [showCompraDatePicker, setShowCompraDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [barcodeErrorMessage, setBarcodeErrorMessage] = useState('');

  const fechaMinima = new Date();
  const fechaMinimaCompra = new Date();
  fechaMinimaCompra.setDate(fechaMinimaCompra.getDate() - 7);

  const sanitizeNameOrBrand = (text: string) => {
    const letrasValidas = text.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    const espacios = (letrasValidas.match(/ /g) || []).length;
    const palabras = letrasValidas.split(/\s+/);
    if (espacios > 5) return palabras.slice(0, 6).join(' ');
    return letrasValidas;
  };

  const formatDecimalInput = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    if (cleaned.startsWith('.')) cleaned = cleaned.slice(1);
    const parts = cleaned.split('.');
    if (parts.length > 2) cleaned = parts[0] + '.' + parts[1];
    if (parts[1]?.length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    return cleaned;
  };

  const validateSingleField = (field: string, value: any) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'productName':
      case 'brand': {
        const soloLetras = value.replace(/[^A-Za-zÀ-ÿ]/g, '');
        if (!value.trim()) newErrors[field] = 'Este campo es obligatorio';
        else if (soloLetras.length < 4)
          newErrors[field] = 'Debe contener al menos 4 letras';
        else delete newErrors[field];
        break;
      }
      case 'stock':
        if (!value || isNaN(Number(value)) || Number(value) <= 0)
          newErrors.stock = 'Stock inválido';
        else delete newErrors.stock;
        break;
      case 'category':
        if (!value || value.trim() === '')
          newErrors.category = 'Selecciona una categoría';
        else delete newErrors.category;
        break;
      case 'purchasePrice':
        if (!value) newErrors.purchasePrice = 'Precio de compra inválido';
        else delete newErrors.purchasePrice;
        break;
      case 'salePrice':
        if (!value) newErrors.salePrice = 'Precio de venta inválido';
        else delete newErrors.salePrice;
        break;
    }
    setErrors(newErrors);
  };

  useEffect(() => {
    const valid =
      productName &&
      brand &&
      stock &&
      category &&
      purchasePrice &&
      salePrice &&
      expirationDate >= fechaMinima &&
      barcode &&
      Object.keys(errors).length === 0;

    setFormValid(valid);
  }, [
    productName,
    brand,
    stock,
    category,
    purchasePrice,
    salePrice,
    expirationDate,
    barcode,
    errors,
  ]);

  const handleBarcodeScanned = async (code: string) => {
    const productosRef = collection(db, 'productos');
    const q = query(productosRef, where('barcode', '==', code));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setErrors((prev) => ({ ...prev, barcode: 'Este código ya existe' }));
      return;
    }

    setBarcode(code);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.barcode;
      return newErrors;
    });
    setBarcodeErrorMessage('');
    setScannerVisible(false);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!productName.trim()) newErrors.productName = 'Este campo es obligatorio';
    else if (productName.replace(/[^A-Za-zÀ-ÿ]/g, '').length < 4)
      newErrors.productName = 'Debe contener al menos 4 letras';

    if (!brand.trim()) newErrors.brand = 'Este campo es obligatorio';
    else if (brand.replace(/[^A-Za-zÀ-ÿ]/g, '').length < 4)
      newErrors.brand = 'Debe contener al menos 4 letras';

    if (!stock || isNaN(Number(stock)) || Number(stock) <= 0)
      newErrors.stock = 'Stock inválido';

    if (!category.trim()) newErrors.category = 'Selecciona una categoría';
    if (!purchasePrice) newErrors.purchasePrice = 'Precio de compra inválido';
    if (!salePrice) newErrors.salePrice = 'Precio de venta inválido';
    if (expirationDate < fechaMinima)
      newErrors.expirationDate = 'Selecciona una fecha más lejana';
    if (!barcode) newErrors.barcode = 'Escanea un código de barras';

    const productosRef = collection(db, 'productos');
    const q = query(productosRef, where('barcode', '==', barcode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      newErrors.barcode = 'Este código de barras ya está registrado';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const doc = {
        productName,
        brand,
        stock: parseInt(stock),
        category,
        compraDate: compraDate.toISOString(),
        purchasePrice: parseFloat(purchasePrice),
        salePrice: parseFloat(salePrice),
        expirationDate: expirationDate.toISOString(),
        barcode,
      };

      await addDoc(collection(db, 'productos'), doc);

      setProductName('');
      setBrand('');
      setStock('');
      setCategory('');
      setPurchasePrice('');
      setSalePrice('');
      setBarcode('');
      setExpirationDate(new Date());
      setCompraDate(new Date());
      setErrors({});
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('Home');
      }, 2500);
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/Registro.json')}
        autoPlay
        loop
        style={styles.lottie}
      />

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.flexItem}>
            <Text style={styles.label}>📦 Nombre</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={(text) => {
                const clean = sanitizeNameOrBrand(text);
                setProductName(clean);
                validateSingleField('productName', clean);
              }}
            />
            {errors.productName && <Text style={styles.errorText}>{errors.productName}</Text>}
          </View>

          <View style={styles.flexItem}>
            <Text style={styles.label}>🏷️ Marca</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={(text) => {
                const clean = sanitizeNameOrBrand(text);
                setBrand(clean);
                validateSingleField('brand', clean);
              }}
            />
            {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
          </View>
        </View>

        <Text style={styles.label}>📊 Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={(text) => {
            const clean = text.replace(/[^0-9]/g, '');
            setStock(clean);
            validateSingleField('stock', clean);
          }}
          keyboardType="numeric"
        />
        {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}

        <Text style={styles.label}>🗂️ Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => {
              setCategory(value);
              validateSingleField('category', value);
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

        <View>
          <View style={styles.row}>
            <Text style={styles.label}>🕒 Fecha de compra</Text>
            <Button title="📅" onPress={() => setShowCompraDatePicker(true)} />
          </View>
          <Text>📅 {compraDate.toLocaleDateString()}</Text>
          {showCompraDatePicker && (
            <DateTimePicker
              value={compraDate}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) setCompraDate(selectedDate);
                setShowCompraDatePicker(false);
              }}
              minimumDate={fechaMinimaCompra}
              maximumDate={fechaMinima}
            />
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.flexItem}>
            <Text style={styles.label}>💵 Compra</Text>
            <TextInput
              style={styles.input}
              value={purchasePrice}
              onChangeText={(text) => {
                const value = formatDecimalInput(text);
                setPurchasePrice(value);
                validateSingleField('purchasePrice', value);
              }}
              keyboardType="decimal-pad"
            />
            {errors.purchasePrice && <Text style={styles.errorText}>{errors.purchasePrice}</Text>}
          </View>

          <View style={styles.flexItem}>
            <Text style={styles.label}>💵 Venta</Text>
            <TextInput
              style={styles.input}
              value={salePrice}
              onChangeText={(text) => {
                const value = formatDecimalInput(text);
                setSalePrice(value);
                validateSingleField('salePrice', value);
              }}
              keyboardType="decimal-pad"
            />
            {errors.salePrice && <Text style={styles.errorText}>{errors.salePrice}</Text>}
          </View>
        </View>

        <View>
          <View style={styles.row}>
            <Text style={styles.label}>🕒 Fecha caducidad</Text>
            <Button title="📅" onPress={() => setShowDatePicker(true)} />
          </View>
          <Text>📅 {expirationDate.toLocaleDateString()}</Text>
          {showDatePicker && (
            <DateTimePicker
              value={expirationDate}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) setExpirationDate(selectedDate);
                setShowDatePicker(false);
              }}
              minimumDate={fechaMinima}
            />
          )}
          {errors.expirationDate && <Text style={styles.errorText}>{errors.expirationDate}</Text>}
        </View>

        <Text style={styles.label}>📇 Código de barras</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} value={barcode} editable={false} />
          <Button title="📷" onPress={() => setScannerVisible(true)} />
        </View>
        {errors.barcode && <Text style={styles.errorText}>{errors.barcode}</Text>}
        {barcodeErrorMessage !== '' && (
          <Text style={styles.alertRed}>{barcodeErrorMessage}</Text>
        )}

        <View style={{ marginTop: 10 }}>
          <Button
            title="💾 Guardar Producto"
            onPress={handleSave}
            color={formValid ? '#28a745' : '#aaa'}
            disabled={!formValid}
          />
        </View>
      </View>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <LottieView
            source={require('../assets/opcion2inicio.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      </Modal>

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: "center",
    alignItems: "center"
  },
  lottie: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  form: {
    width: '100%',
    maxWidth: 320, // ancho máximo para mantenerlo compacto
    gap: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 13,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    marginTop: -4,
    marginBottom: 6,
  },
  alertRed: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    padding: 6,
    borderRadius: 5,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  flexItem: {
    flex: 1,
  },
});
