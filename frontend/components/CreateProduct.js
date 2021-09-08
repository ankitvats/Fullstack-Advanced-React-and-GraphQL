import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import Router from 'next/router';
import useForm from '../lib/useForm';
import Form from './styles/Form';
import DisplayError from './ErrorMessage';
import { ALL_PRODUCTS_QUERY } from './Products';

const CREATE_PRODUCT_MUTATION = gql`
  mutation CREATE_PRODUCT_MUTATION(
    # Which variable is getting passed in? And what types are they
    $name: String!
    $description: String!
    $price: Int!
    $image: Upload
  ) {
    createProduct(
      # Dynamic variables
      data: {
        name: $name
        description: $description
        price: $price
        status: "AVAILABLE"
        # Nested Query - keystone specific
        photo: { create: { image: $image, altText: $name } }
      }
    ) {
      id
      name
      description
    }
  }
`;

export default function CreateProduct() {
  const { inputs, handleChange, clearForm } = useForm({
    image: '',
    name: 'dsfhjk',
    price: 343,
    description: 'dskflj',
  });
  // useMutation hook takes an mutation query & return async function to fire this mutation & payloads
  const [createProduct, { loading, error, data }] = useMutation(
    CREATE_PRODUCT_MUTATION,
    {
      variables: inputs,
      refetchQueries: [{ query: ALL_PRODUCTS_QUERY }],
    }
  );
  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();
        // Submit the input fields to the backend
        const res = await createProduct();
        clearForm();
        // Redirect to the product page
        Router.push({
          pathname: `/product/${res.data.createProduct.id}`,
        });
      }}
    >
      {/* A component to display errors */}
      <DisplayError error={error} />
      {/* field set can disable the whole form at once */}
      <fieldset disabled={loading} aria-busy={loading}>
        <label htmlFor="image">
          Image
          <input
            required
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
          />
        </label>
        <label htmlFor="name">
          Name
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            value={inputs.name}
            onChange={handleChange}
          />
        </label>
        <label htmlFor="price">
          Price
          <input
            type="number"
            id="price"
            name="price"
            placeholder="price"
            value={inputs.price}
            onChange={handleChange}
          />
        </label>
        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            placeholder="Description"
            value={inputs.description}
            onChange={handleChange}
          />
        </label>
        <button type="submit">+ Add Product</button>
      </fieldset>
    </Form>
  );
}
