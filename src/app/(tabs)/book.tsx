import { SearchForm } from '@/components/search-form';
import { Screen, Text } from '@/design-system';

export default function Book() {
  return (
    <Screen>
      <Text variant="display">Book a flight</Text>
      <Text variant="caption">Domestic routes across Ethiopia, with fares from Basic to Flex.</Text>
      <SearchForm />
    </Screen>
  );
}
