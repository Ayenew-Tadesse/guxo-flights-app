import { SearchForm } from '@/components/search-form';
import { AppText } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';

export default function Book() {
  return (
    <Screen>
      <AppText variant="title">Book a flight</AppText>
      <AppText variant="caption">Domestic routes across Ethiopia, with fares from Basic to Flex.</AppText>
      <SearchForm />
    </Screen>
  );
}
