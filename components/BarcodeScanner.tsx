import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, BarcodeScanningResult } from 'expo-camera';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function BarcodeScanner({ visible, onClose, onScan }: Props) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            {/* Overlay oscuro con ventana */}
            <View style={styles.overlay}>
              <View style={styles.transparentWindow} />
            </View>

            {/* Botones sobre la cámara */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setFacing((current) => (current === 'back' ? 'front' : 'back'))
                }
              >
                <Text style={styles.text}>Cambiar Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.text}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
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
    justifyContent: 'space-around',
    zIndex: 2,
  },
  button: {
    backgroundColor: '#00000080',
    padding: 10,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#c00',
    padding: 10,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
  },
});
