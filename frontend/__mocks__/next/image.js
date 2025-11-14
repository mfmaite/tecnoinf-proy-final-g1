export default function ImageMock(props) {
  return <img {...props} alt={props.alt || 'Mocked image'} />;
}
