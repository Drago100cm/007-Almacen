import React, { useState, useEffect } from 'react';
import { View,Text,TextInput,Button,ScrollView,StyleSheet,Modal, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import BarcodeScanner from '../components/BarcodeScanner';

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [barcodeErrorMessage, setBarcodeErrorMessage] = useState('');

  const fechaMinima = new Date();
  fechaMinima.setMonth(fechaMinima.getMonth() + 2);

  const sanitizeNameOrBrand = (text: string) => {
    const letrasValidas = text.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    const espacios = (letrasValidas.match(/ /g) || []).length;
    const palabras = letrasValidas.split(/\s+/);
    if (espacios > 5) return palabras.slice(0, 6).join(' ');
    return letrasValidas;
  };

  const formatDecimalInput = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts[1];
    if (parts[1]?.length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
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

    const soloLetrasProducto = productName.replace(/[^A-Za-zÀ-ÿ]/g, '');
    const soloLetrasMarca = brand.replace(/[^A-Za-zÀ-ÿ]/g, '');

    if (!productName.trim())
      newErrors.productName = 'Este campo es obligatorio';
    else if (soloLetrasProducto.length < 4)
      newErrors.productName = 'Debe contener al menos 4 letras';

    if (!brand.trim())
      newErrors.brand = 'Este campo es obligatorio';
    else if (soloLetrasMarca.length < 4)
      newErrors.brand = 'Debe contener al menos 4 letras';

    if (!stock || isNaN(Number(stock)) || Number(stock) <= 0)
      newErrors.stock = 'Stock inválido';

    if (!category.trim())
      newErrors.category = 'Selecciona una categoría';

    if (!purchasePrice)
      newErrors.purchasePrice = 'Precio de compra inválido';

    if (!salePrice)
      newErrors.salePrice = 'Precio de venta inválido';

    if (expirationDate < fechaMinima)
      newErrors.expirationDate = 'Selecciona una fecha más lejana';

    if (!barcode)
      newErrors.barcode = 'Escanea un código de barras';

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
        purchasePrice: parseFloat(purchasePrice),
        salePrice: parseFloat(salePrice),
        expirationDate: expirationDate.toISOString(),
        barcode,
      };

      await addDoc(productosRef, doc);

      setProductName('');
      setBrand('');
      setStock('');
      setCategory('');
      setPurchasePrice('');
      setSalePrice('');
      setBarcode('');
      setExpirationDate(new Date());
      setErrors({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LottieView
        source={require('../assets/Registro.json')}
        autoPlay
        loop
        style={styles.lottie}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Nombre del producto</Text>
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

        <Text style={styles.label}>Marca</Text>
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

        <Text style={styles.label}>Stock</Text>
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

        <Text style={styles.label}>Categoría</Text>
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

        <Text style={styles.label}>Precio de compra</Text>
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

        <Text style={styles.label}>Precio de venta</Text>
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

        <Text style={styles.label}>Fecha de caducidad</Text>
        <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
        <Text style={{ marginTop: 5 }}>
          📅 Seleccionada: {expirationDate.toLocaleDateString()}
        </Text>
        {showDatePicker && (
          <DateTimePicker
            value={expirationDate}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              if (selectedDate) {
                setExpirationDate(selectedDate);
              }
              setShowDatePicker(false);
            }}
            minimumDate={fechaMinima}
          />
        )}
        {errors.expirationDate && <Text style={styles.errorText}>{errors.expirationDate}</Text>}

        <Text style={styles.label}>Código de barras</Text>
        <TextInput style={styles.input} value={barcode} editable={false} />
        {errors.barcode && <Text style={styles.errorText}>{errors.barcode}</Text>}
        {barcodeErrorMessage !== '' && (
          <Text style={styles.alertRed}>{barcodeErrorMessage}</Text>
        )}

        <Button title="Escanear Código de Barras" onPress={() => setScannerVisible(true)} />
        <Button
          title="Guardar Producto"
          onPress={handleSave}
          color={formValid ? '#28a745' : '#aaa'}
          disabled={!formValid}
        />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, backgroundColor: '#fff' },
  lottie: { width: 200, height: 200, alignSelf: 'center', marginBottom: 10 },
  form: { gap: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
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
  alertRed: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
