import { ControlsScreen } from '../components/controls/ControlsScreen';

export default function AccountControlsPage() {
  return <ControlsScreen cfg={{ kind: 'account', eyebrow: 'Core banking', title: 'Account controls', description: 'Block or unblock customer accounts. Every change needs a second approver.', noun: 'account', path: '/account-controls' }} />;
}
