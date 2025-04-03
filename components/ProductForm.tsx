import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface Props {
  productName: string;
  setProductName: (value: string) => void;
  barcode: string;
  setBarcode: (value: string) => void;
  onSave: () => void;
}

export default function ProductForm({ productName, setProductName, barcode, setBarcode, onSave }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del producto"
        value={productName}
        onChangeText={setProductName}
        style={styles.input}
      />
      <TextInput
        placeholder="Código de barras"
        value={barcode}
        editable={false}
        style={styles.input}
      />
      <Button title="Guardar Producto" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 }
});
