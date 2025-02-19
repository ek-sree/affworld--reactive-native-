import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TagCollectionProps {
  title: string;
  tags: string[];
  availableTags?: string[];
  onRemoveTag?: (tag: string) => void;
  onAddTag?: (tag: string) => void;
  editable?: boolean;
}

const TagCollection: React.FC<TagCollectionProps> = ({
  title,
  tags,
  availableTags = [],
  onRemoveTag,
  onAddTag,
  editable = false
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={`${tag}-${index}`} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            {editable && onRemoveTag && (
              <TouchableOpacity
                onPress={() => onRemoveTag(tag)}
                style={styles.removeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={16} color="#4B5563" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {editable && availableTags.length > 0 && (
        <View style={styles.availableTagsSection}>
          <Text style={styles.subtitle}>Available {title}</Text>
          <View style={styles.tagsContainer}>
            {availableTags.map((tag, index) => (
              <TouchableOpacity
                key={`available-${tag}-${index}`}
                onPress={() => onAddTag && onAddTag(tag)}
              >
                <View style={styles.availableTag}>
                  <Text style={styles.availableTagText}>{tag}</Text>
                  <MaterialCommunityIcons name="plus" size={16} color="#2563EB" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
  availableTagsSection: {
    marginTop: 8,
  },
  availableTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availableTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
    marginRight: 4,
  },
});

export default TagCollection;