import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function BarcodeScanner({ visible, onClose, onScan }: Props) {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!scannedCodes.includes(data)) {
      setScannedCodes((prev) => [...prev, data]);
      onScan(data);
    }
  };

  const handleClose = () => {
    setScannedCodes([]); // Resetear escaneos para la próxima vez
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.transparentWindow} />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.text}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </CameraView>

          {scannedCodes.length > 0 && (
            <View style={styles.codeList}>
              <Text style={styles.codeListTitle}>Escaneados:</Text>
              <FlatList
                data={scannedCodes}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => (
                  <Text style={styles.codeItem}>• {item}</Text>
                )}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');
const windowWidth = 250;
const windowHeight = 80;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  transparentWindow: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeButton: {
    backgroundColor: '#c00',
    padding: 10,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
  },
  codeList: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: '#00000099',
    padding: 10,
    borderRadius: 10,
    maxHeight: 150,
  },
  codeListTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  codeItem: {
    color: '#fff',
    fontSize: 12,
  },
});
