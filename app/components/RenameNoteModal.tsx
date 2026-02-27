import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface RenameNoteModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (newName: string) => void;
    initialName: string;
}

const RenameNoteModal: React.FC<RenameNoteModalProps> = ({ visible, onClose, onConfirm, initialName }) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (visible) {
            setName(initialName);
        }
    }, [visible, initialName]);

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirm(name.trim());
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Rename Recording</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        selectionColor="#4A90E2"
                        placeholder="Recording name"
                        placeholderTextColor="#8A9BCC"
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
                            onPress={handleConfirm}
                            disabled={!name.trim()}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#1E3C8A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#4A90E2',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default RenameNoteModal;
