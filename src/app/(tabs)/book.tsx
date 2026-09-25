import { SearchForm } from '@/components/search-form';
import { AccountButtons } from '@/components/ui';
import { Screen, TopBar } from '@/design-system';

export default function Book() {
  return (
    <Screen top={<TopBar title="Book a Flight" right={<AccountButtons bell={false} />} />}>
      <SearchForm compact />
    </Screen>
  );
}
