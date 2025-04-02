import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function Formulario() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [barcode, setBarcode] = useState('');

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Función para validar el nombre del producto
  const validateName = (text: string) => {
    const regex = /^(?!.*\.\.)(?!.*\s{2,})[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(text.trim()) && text.trim().length > 0;
  };

  // Función para validar los precios
  const validatePrice = (text: string) => {
    const regex = /^(?!^0(\.0+)?$)(\d+(\.\d{0,2})?)$/;
    return regex.test(text);
  };

  // Función para consultar el stock de un producto por nombre
  const fetchStockByProductName = async (name: string) => {
    const q = query(collection(db, "productos"), where("productName", "==", name));
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size; // La cantidad de productos con ese nombre
    setStock(count.toString()); // Actualiza el stock con la cantidad
  };

  // Maneja el cambio del nombre del producto
  const handleProductNameChange = async (text: string) => {
    if (validateName(text)) {
      setProductName(text);
      await fetchStockByProductName(text); // Consulta el stock cada vez que cambie el nombre
    } else if (text.trim() === '') {
      setProductName('');
      setStock('');
    }
  };

  const handleBrandChange = (text: string) => {
    if (validateName(text)) {
      setBrand(text);
    } else if (text.trim() === '') {
      setBrand('');
    }
  };

  const handlePurchasePriceChange = (text: string) => {
    if (validatePrice(text)) {
      setPurchasePrice(text);
    } else if (text.trim() === '') {
      setPurchasePrice('');
    }
  };

  const handleSalePriceChange = (text: string) => {
    if (validatePrice(text)) {
      setSalePrice(text);
    } else if (text.trim() === '') {
      setSalePrice('');
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setBarcode(data);
    Alert.alert("Código Escaneado", `Código: ${data}`, [
      { text: "OK", onPress: () => {
          setIsCameraOpen(false);
          setScanned(false);
        }}
    ]);
  };

  function handleSave() {
    if (!productName || !category || !stock || !brand || !purchasePrice || !salePrice || !barcode || !selectedDate) {
      Alert.alert("Error", "Por favor, llena todos los campos.");
    } else {
      
      addDoc(collection(db, "productos"), {
        productName,
        category,
        stock,
        brand,
        purchasePrice,
        salePrice,
        barcode,
        expirationDate: selectedDate
      })
      .then(() => {
        handleCancel();
        Alert.alert("Producto Guardado", `Nombre: ${productName}\nCategoría: ${category}\nCódigo: ${barcode}`);
      })
      .catch((error) => {
        Alert.alert("Error", `Error al guardar el producto: ${error.message}`);
      });
    }
  }

  function handleCancel() {
    setProductName('');
    setCategory('');
    setStock('');
    setBrand('');
    setPurchasePrice('');
    setSalePrice('');
    setBarcode('');
    setSelectedDate('');
    Alert.alert("Formulario Cancelado", "Los campos han sido limpiados.");
  }

  const calculateMinDate = () => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 2);
    return currentDate.toISOString().split('T')[0];
  };

  const minDate = calculateMinDate();

  return (
    <View style={styles.container}>
      {/* Formulario */}
      <View style={styles.row}>
        <TextInput
          style={styles.Alineado}
          placeholder="Nombre del producto"
          value={productName}
          onChangeText={handleProductNameChange}
        />
        <TextInput
          style={styles.Alineado}
          placeholder="Marca"
          value={brand}
          onChangeText={handleBrandChange}
        />
        <TextInput
          style={styles.Alineado}
          placeholder="Stock"
          value={stock}
          editable={false} // No se puede editar el campo de stock
        />
      </View>

      {/* Picker para la categoría */}
      <View style={styles.input}>
        <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={{ height: 50 }}>
          <Picker.Item label="Seleccionar Categoría" value="" />
          <Picker.Item label="Tecnología" value="Tecnología" />
          <Picker.Item label="Ropa y Moda" value="Ropa y Moda" />
          <Picker.Item label="Hogar y Muebles" value="Hogar y Muebles" />
          <Picker.Item label="Alimentos y Bebidas" value="Alimentos y Bebidas" />
          <Picker.Item label="Salud" value="Salud" />
          <Picker.Item label="Deportes" value="Deportes " />
          <Picker.Item label="Juguetes y Juegos" value="Juguetes y Juegos" />
          <Picker.Item label="Automotriz" value="Automotriz" />
          <Picker.Item label="Libros" value="Libros" />
          <Picker.Item label="Hobbies y Arte" value="Hobbies y Arte" />
          <Picker.Item label="Ciencia" value="Ciencia" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.calendarButton} onPress={() => setIsCalendarVisible(true)}>
        <Text style={styles.calendarButtonText}>Fecha de caducidad: {selectedDate}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TextInput
          style={styles.precio}
          placeholder="Precio de Compra"
          keyboardType="numeric"
          value={purchasePrice}
          onChangeText={handlePurchasePriceChange}
        />
        <TextInput
          style={styles.precio}
          placeholder="Precio de Venta"
          keyboardType="numeric"
          value={salePrice}
          onChangeText={handleSalePriceChange}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Código de Barras"
        value={barcode}
        editable={false} // El código de barras no es editable
      />

      <TouchableOpacity style={styles.scanButton} onPress={() => setIsCameraOpen(true)}>
        <Text style={styles.scanButtonText}>Escanear Código</Text>
      </TouchableOpacity>

      {/* Modal de cámara */}
      <Modal visible={isCameraOpen} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={facing}
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}>
                  <Text style={styles.text}>Cambiar Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraOpen(false)}>
                  <Text style={styles.text}>Cerrar Cámara</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </View>
      </Modal>

      {/* Modal calendario */}
      <Modal visible={isCalendarVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContainer}>
            <Calendar
              current={new Date().toISOString().split('T')[0]}
              minDate={minDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setIsCalendarVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',//cambiar color
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  Alineado: {
    width: '30%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  precio: {
    width: '40%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  scanButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  calendarButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  calendarButtonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  closeModalButton: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraContainer: {
    width: '90%',
    height: '50%',
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: "100%",
    height:"50%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  }
});
