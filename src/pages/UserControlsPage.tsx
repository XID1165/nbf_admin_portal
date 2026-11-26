import { ControlsScreen } from '../components/controls/ControlsScreen';

export default function UserControlsPage() {
  return <ControlsScreen cfg={{ kind: 'user', eyebrow: 'Digital banking', title: 'User controls', description: 'Block or unblock NBF Direct users. Every change needs a second approver.', noun: 'user', path: '/user-controls' }} />;
}
